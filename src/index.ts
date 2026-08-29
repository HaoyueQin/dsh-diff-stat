/**
 * dsh-diff-stat — host half (M4).
 *
 * A fenced read/mutation API for the browser half, served on this plugin's own
 * prefix route (the same webServer pattern the super-injector's manager uses):
 *
 *   POST /dsh-diff-stat/api/files.read  { cwd, path }
 *   POST /dsh-diff-stat/api/undo        { cwd, files }
 *   POST /dsh-diff-stat/api/open-with   { cwd, path, target }
 *   GET  /dsh-diff-stat/api/ping
 *
 * Fence semantics follow dsh-file-review: every path resolves against the
 * session workspace root with realpath containment (checked before AND after
 * resolution, so symlinks cannot smuggle a path out), symlinks are rejected,
 * only regular files are touched, text is validated by a UTF-8 round-trip,
 * reads cap at 512 KiB with an explicit truncated flag, and undo applies a
 * hunk chain in memory first — any drift (expected text absent or ambiguous)
 * rejects the whole file before a byte is written. Writes go through
 * writeFileAtomic; creates made by a turn are undone by deleting the file.
 *
 * Trust model: this route is same-origin and unauthenticated, exactly like
 * every other plugin-served Web API — it must not be more powerful than the
 * page that calls it. undo/open-with exist for user-clicked card actions only.
 */
import { spawn } from 'node:child_process'
import { readFile, lstat, realpath, readdir, unlink } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { classifyCreate, createRefusalError, snapshotProbeFrom, type SnapshotProbe } from './undo-plan.ts'

export const name = 'dsh-diff-stat'

/** The webServer service hosts this plugin's fenced prefix route. */
export const inject = ['webServer']

/** The plugin's own API prefix (package name; '/'-safe in a URL path). */
const API_PREFIX = '/dsh-diff-stat/api'
/** Read cap in bytes; larger text files answer with truncated: true. */
const READ_CAP = 512 * 1024
/** Request body cap — undo payloads carry hunks, so allow a few MiB. */
const BODY_CAP = 4 * 1024 * 1024

/** Structural webServer contract this plugin depends on (inject: 'webServer'). */
interface WebServerService {
  register(registration: {
    kind: 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

/** One reversible hunk as the client's turn accumulator recorded it. */
interface UndoHunk {
  oldText: string | null
  newText: string
}

interface UndoFile {
  path: string
  diffs: UndoHunk[]
}

/** A resolved, fence-checked file: real path, bytes, and validated text. */
interface ResolvedFile {
  /** The request-side path (pre-realpath), kept for swap re-verification. */
  candidate: string
  filename: string
  mode: number
  bytes: Buffer
  text: string
}

/**
 * Re-verify that a request-side path still resolves to the same target file.
 * The lstat/realpath/readFile sequence is otherwise a check-then-use race: a
 * swap to a symlink between the checks would make the follow-up read or write
 * land elsewhere. Resolves to identity, throws on drift (drift = reject, and
 * already-read bytes are simply never returned).
 */
async function assertSamePath(candidate: string, filename: string): Promise<void> {
  const now = await realpath(candidate)
  if (now !== filename) throw new Error('file changed while being accessed (link swap)')
}

/** Path containment: candidate is root itself or below it (no .. escape). */
function inside(root: string, candidate: string): boolean {
  const child = relative(root, candidate)
  return child === '' || (!child.startsWith('..') && !isAbsolute(child))
}

/**
 * Resolve a requested path inside the workspace with the full fence: realpath
 * the root, contain the candidate, reject symlinks and non-files, re-contain
 * the resolved path, then validate UTF-8 by round-trip.
 */
async function resolveFile(cwd: string, requestedPath: string): Promise<ResolvedFile> {
  if (typeof cwd !== 'string' || cwd === '') throw new Error('cwd is required')
  if (typeof requestedPath !== 'string' || requestedPath === '') throw new Error('path is required')
  const root = await realpath(cwd)
  const candidate = resolve(root, requestedPath)
  if (!inside(root, candidate)) throw new Error('path is outside the session workspace')
  const linkStat = await lstat(candidate)
  if (linkStat.isSymbolicLink()) throw new Error('symbolic links are not supported')
  if (!linkStat.isFile()) throw new Error('path is not a regular file')
  const filename = await realpath(candidate)
  if (!inside(root, filename)) throw new Error('resolved path is outside the session workspace')
  const bytes = await readFile(filename)
  await assertSamePath(candidate, filename)
  const text = bytes.toString('utf8')
  if (!Buffer.from(text, 'utf8').equals(bytes)) throw new Error('file is not valid UTF-8 text')
  return { candidate, filename, mode: linkStat.mode & 0o777, bytes, text }
}

/**
 * Replace the ONE occurrence of source with replacement, or null when the
 * text drifted (source absent, or present more than once — ambiguity means
 * we are not looking at the file the turn produced).
 */
function replaceUnique(text: string, source: string, replacement: string): string | null {
  if (source === '') return null
  const at = text.indexOf(source)
  if (at === -1) return null
  if (text.indexOf(source, at + 1) !== -1) return null
  return text.slice(0, at) + replacement + text.slice(at + source.length)
}

/**
 * Undo one file's hunk chain in memory: peel edits in reverse settlement
 * order (applied text → prior text, uniqueness-checked), and when the chain
 * bottoms out at a create (oldText null), require the peeled text to equal
 * the created content exactly, then delete — but only when the turn snapshot
 * proves the file did not exist before the turn (a write that overwrote an
 * existing file also carries oldText: null, and its prior content is
 * unrecoverable, so deleting there would destroy a pre-existing file).
 * Returns the file's outcome.
 */
async function undoFile(cwd: string, turn: number | undefined, file: UndoFile): Promise<{ path: string; ok: boolean; error?: string; deleted?: boolean }> {
  try {
    if (!Array.isArray(file.diffs) || file.diffs.length === 0) {
      return { path: file.path, ok: false, error: 'no hunks recorded' }
    }
    const resolved = await resolveFile(cwd, file.path)
    let text = resolved.text
    let created = false
    for (let i = file.diffs.length - 1; i >= 0; i -= 1) {
      const hunk = file.diffs[i]
      if (hunk === undefined || typeof hunk.newText !== 'string') {
        return { path: file.path, ok: false, error: 'malformed hunk' }
      }
      if (hunk.oldText === null) {
        // The create (or overwrite-rendering) at the bottom of this file's
        // chain. Peeled text must equal the write's full content, then the
        // snapshot decides: create → delete; overwrite / unverified → refuse.
        if (text !== hunk.newText) return { path: file.path, ok: false, error: 'file drifted from the recorded create' }
        const classification = classifyCreate(
          typeof turn === 'number' ? snapshotProbe(cwd, turn) : undefined,
          resolved.filename,
        )
        if (classification !== 'create') {
          return { path: file.path, ok: false, error: createRefusalError(classification) }
        }
        created = true
      } else if (typeof hunk.oldText !== 'string') {
        return { path: file.path, ok: false, error: 'malformed hunk' }
      } else {
        const next = replaceUnique(text, hunk.newText, hunk.oldText)
        if (next === null) return { path: file.path, ok: false, error: 'file drifted: expected applied text not found or ambiguous' }
        text = next
      }
    }
    // Re-verify before the destructive step: the file may have been swapped
    // to a link since resolveFile's read-time check.
    await assertSamePath(resolved.candidate, resolved.filename)
    if (created) {
      await unlink(resolved.filename)
      return { path: file.path, ok: true, deleted: true }
    }
    await writeFileAtomic(resolved.filename, text, { mode: resolved.mode })
    return { path: file.path, ok: true }
  } catch (error) {
    return { path: file.path, ok: false, error: String((error as Error).message ?? error) }
  }
}

/** Spawn one of the two whitelisted openers; both are fire-and-forget. */
function openWith(cwd: string, requestedPath: string, target: unknown): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    void (async () => {
      try {
        // Fence the path like every other endpoint: the opener must not
        // become a probe for paths outside the session workspace.
        const resolved = await resolveFile(cwd, requestedPath)
        // Both openers run a quoted command line through the shell, and cmd
        // expands %VAR% inside quotes — a name like report%TEMP%.md would
        // silently open something else. NTFS forbids quotes in names anyway;
        // reject both characters up front on the value that reaches the line.
        if (/["%]/.test(resolved.filename)) {
          rejectPromise(new Error('path contains a shell-special character (quote or %)'))
          return
        }
        if (target === 'explorer') {
          // explorer /select,"<path>" reveals the file in its folder. The
          // quoting CANNOT survive spawn's array form: Node re-escapes the
          // embedded quotes and explorer, seeing a mangled argument, falls
          // back to its default view. Pass the literal line through the shell.
          const child = spawn('explorer /select,"' + resolved.filename + '"', { shell: true, detached: true, stdio: 'ignore' })
          child.unref()
          child.once('error', rejectPromise)
          // explorer returns a nonzero/late exit by design; the spawn
          // succeeding is the signal.
          setTimeout(() => resolvePromise(), 300)
        } else if (target === 'vscode') {
          // code is a .cmd shim on Windows; shell: true resolves it.
          const child = spawn('code "' + resolved.filename + '"', { shell: true, detached: true, stdio: 'ignore' })
          child.unref()
          child.once('error', rejectPromise)
          setTimeout(() => resolvePromise(), 300)
        } else {
          rejectPromise(new Error('unknown open-with target'))
        }
      } catch (error) {
        rejectPromise(error)
      }
    })()
  })
}

/**
 * Turn-start file-existence snapshots for the undo create/overwrite guard.
 * A wire `write` (or str_replace_editor create/insert) records oldText: null
 * for BOTH a fresh creation and an overwrite; without the snapshot undo can
 * only guess, and guessing wrong deletes a file that pre-existed the turn.
 * The snapshot records existence only (never content, never reads file
 * bytes), so capture cost is one directory walk of the workspace with
 * node_modules/.git skipped — cheap enough to run per turn.
 */
const SNAPSHOT_MAX_TURNS = 16
const SNAPSHOT_MAX_FILES = 100_000
const SNAPSHOT_SKIP_DIRS = new Set(['node_modules', '.git'])

interface TurnSnapshot {
  readonly at: number
  readonly files: ReadonlySet<string>
  readonly truncated: boolean
}

/** key = cwd + '\0' + turn; insertion order doubles as the LRU (evict oldest first). */
const turnSnapshots = new Map<string, TurnSnapshot>()

function snapshotKey(cwd: string, turn: number): string {
  return cwd + '\0' + turn
}

/** The probe semantic undo needs: undefined turn → undefined answers. */
function snapshotProbe(cwd: string, turn: number): SnapshotProbe | undefined {
  return snapshotProbeFrom(turnSnapshots.get(snapshotKey(cwd, turn)))
}

/**
 * Capture one turn's file-existence snapshot. Existence only: file bytes are
 * never read and content is never stored. Best-effort — directories that
 * cannot be listed contribute nothing, and a workspace that resolves to no
 * real path answers an explicit error (the undo path then refuses deletions).
 */
async function captureSnapshot(cwd: string, turn: unknown): Promise<{ ok: boolean; files?: number; truncated?: boolean; error?: string }> {
  if (typeof cwd !== 'string' || cwd === '') return { ok: false, error: 'cwd is required' }
  const turnNo = Number(turn)
  if (!Number.isInteger(turnNo) || turnNo < 1) return { ok: false, error: 'turn is required' }
  let root: string
  try {
    root = await realpath(cwd)
  } catch {
    return { ok: false, error: 'workspace not resolved' }
  }
  // Idempotent: the first capture for a (cwd, turn) pair wins. A window reload
  // re-running the start match must NOT re-capture at its later time, or a
  // file created by the turn would look pre-existing and undo would refuse
  // its deletion.
  const existingKey = snapshotKey(cwd, turnNo)
  if (turnSnapshots.has(existingKey)) return { ok: true, files: turnSnapshots.get(existingKey)!.files.size, truncated: turnSnapshots.get(existingKey)!.truncated }
  const files = new Set<string>()
  let truncated = false
  // Full tree, no depth cap: node_modules/.git are skipped and the file cap is
  // the only bound — a path omitted by ANY depth limit would classify as a
  // create and be deleted, which is the one wrong direction this guard must
  // never take. Truncation is recorded and downgrades absence to unverified.
  const walk = async (dir: string): Promise<void> => {
    if (truncated) return
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (files.size >= SNAPSHOT_MAX_FILES) {
        truncated = true
        return
      }
      if (SNAPSHOT_SKIP_DIRS.has(entry.name)) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (entry.isFile()) files.add(full)
    }
  }
  await walk(root)
  turnSnapshots.set(existingKey, { at: Date.now(), files, truncated })
  while (turnSnapshots.size > SNAPSHOT_MAX_TURNS) {
    const oldest = turnSnapshots.keys().next().value
    if (oldest === undefined) break
    turnSnapshots.delete(oldest)
  }
  return { ok: true, files: files.size, truncated }
}

/** Read the request body with a hard cap; rejects oversized or non-JSON bodies. */
function readJsonBody(req: IncomingMessage, res: ServerResponse): Promise<Record<string, unknown>> {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > BODY_CAP) {
        rejectPromise(new Error('request body too large'))
        // Answer before destroying: a bare destroy surfaces as a network
        // failure to the client, indistinguishable from the host being gone.
        res.writeHead(413, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'request body too large' }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        if (parsed === null || typeof parsed !== 'object') rejectPromise(new Error('body must be a JSON object'))
        else resolvePromise(parsed as Record<string, unknown>)
      } catch (error) {
        rejectPromise(new Error('invalid JSON body: ' + String((error as Error).message ?? error)))
      }
    })
    req.on('error', rejectPromise)
  })
}

/**
 * Slice a byte buffer at a complete UTF-8 sequence boundary: a raw cap cut
 * can land mid-sequence, and the truncated tail would decode to U+FFFD. Walk
 * back over at most three continuation bytes to the sequence's lead byte and
 * drop the tail only when that lead byte declares more bytes than remain.
 */
function utf8SafeSlice(bytes: Buffer): Buffer {
  for (let back = 1; back <= 3 && back <= bytes.length; back += 1) {
    const byte = bytes[bytes.length - back]
    if (byte === undefined) break
    if ((byte & 0b1100_0000) === 0b1000_0000) continue
    const need = byte >= 0b1111_0000 ? 4 : byte >= 0b1110_0000 ? 3 : byte >= 0b1100_0000 ? 2 : 1
    if (need > back) return bytes.subarray(0, bytes.length - back)
    break
  }
  return bytes
}

/** Send one JSON response and end the request. */
function respond(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

export function apply(ctx: Context): void {
  const webServer = (ctx as Context & { webServer?: WebServerService }).webServer
  if (webServer === undefined) {
    // Host half is optional by design (client degrades: no 撤销/内嵌查看/定向打开).
    ctx.logger?.warn?.('[dsh-diff-stat] webServer service absent — fenced file API disabled')
    return
  }
  ctx.effect(() => webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      const route = (req.url ?? '/').split('?')[0]
      try {
        if (route === '/ping' || route === API_PREFIX + '/ping') {
          respond(res, 200, { ok: true })
          return
        }
        if (req.method !== 'POST') {
          respond(res, 405, { ok: false, error: 'POST only' })
          return
        }
        const action = route.startsWith(API_PREFIX + '/') ? route.slice(API_PREFIX.length + 1) : (route.startsWith('/') ? route.slice(1) : route)
        const body = await readJsonBody(req, res)
        if (action === 'files.read') {
          const resolved = await resolveFile(String(body['cwd'] ?? ''), String(body['path'] ?? ''))
          if (resolved.bytes.includes(0)) {
            respond(res, 200, { kind: 'binary', truncated: false, size: resolved.bytes.length })
            return
          }
          const truncated = resolved.bytes.length > READ_CAP
          const raw = truncated
            ? utf8SafeSlice(resolved.bytes.subarray(0, READ_CAP)).toString('utf8')
            : resolved.text
          // Display layer only: strip a leading UTF-8 BOM so the first diff
          // line does not carry an invisible U+FEFF. Undo paths keep the
          // original text and therefore the BOM byte-for-byte.
          const content = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
          respond(res, 200, { kind: 'text', content, truncated, size: resolved.bytes.length })
          return
        }
        if (action === 'snapshot') {
          respond(res, 200, await captureSnapshot(String(body['cwd'] ?? ''), body['turn']))
          return
        }
        if (action === 'undo') {
          const files = body['files']
          if (!Array.isArray(files)) {
            respond(res, 200, { ok: false, error: 'files must be an array', results: [] })
            return
          }
          const turn = body['turn']
          const turnNo = typeof turn === 'number' && Number.isInteger(turn) && turn >= 1 ? turn : undefined
          const results = []
          for (const file of files as UndoFile[]) {
            results.push(await undoFile(String(body['cwd'] ?? ''), turnNo, {
              path: String(file.path ?? ''),
              diffs: Array.isArray(file.diffs)
                ? file.diffs.map(hunk => ({
                  oldText: hunk === null || typeof hunk !== 'object' ? null : (hunk as UndoHunk).oldText ?? null,
                  newText: hunk === null || typeof hunk !== 'object' ? '' : String((hunk as UndoHunk).newText ?? ''),
                }))
                : [],
            }))
          }
          respond(res, 200, { ok: results.every(r => r.ok), results })
          return
        }
        if (action === 'open-with') {
          await openWith(String(body['cwd'] ?? ''), String(body['path'] ?? ''), body['target'])
          respond(res, 200, { ok: true })
          return
        }
        respond(res, 404, { ok: false, error: 'unknown action' })
      } catch (error) {
        respond(res, 200, { ok: false, error: String((error as Error).message ?? error) })
      }
    },
  }), 'dsh-diff-stat: fenced file api')
}