/**
 * File-context booster for arg-derived diff hunks. A PTC dispatch fragment is
 * the bare old_string → new_string slice — no file context around it — while
 * the host bakes ±3 context lines into applied wire hunks. When such a fragment
 * is expanded, this module reads the file through the host half's fenced
 * files.read, locates the fragment's post-image inside the file, and rebuilds
 * the hunk with up to BOOST_CONTEXT_LINES shared lines on each side, which the
 * window's alignment then renders as ordinary grey context. Pure best-effort:
 * a missing, unreadable, truncated, or since-re-edited file leaves the hunk
 * exactly as it was.
 */
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import { contentLines, isArgHunk } from './diff-contract.ts'
import { ALIGN_MAX_SIDE_LINES } from './diff-align.ts'
import { hostCall } from './api.ts'

/** Shared lines kept on each side of the located fragment (host parity). */
export const BOOST_CONTEXT_LINES = 3

/** LRU cap of the file-content cache (one expanded file ≈ one entry). */
const CACHE_CAP = 16

/** Module-side content cache: cwd-fenced path → full text. */
const cache = new Map<string, string>()

/** Read one file through the host half, LRU-cached; null when unavailable. */
async function readCached(path: string, cwd: string | undefined): Promise<string | null> {
  const key = (cwd ?? '') + '\0' + path
  const hit = cache.get(key)
  if (hit !== undefined) {
    cache.delete(key)
    cache.set(key, hit)
    return hit
  }
  const result = await hostCall<{ kind: string; content?: string }>('files.read', { cwd, path })
  if (result === null || result.kind !== 'text' || typeof result.content !== 'string') return null
  cache.set(key, result.content)
  if (cache.size > CACHE_CAP) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  return result.content
}

/**
 * Rebuild one hunk with file context around the located fragment, or null when
 * the fragment does not sit in the given file lines verbatim (re-edited since,
 * empty post-image) or has no context to add (file edges). The context lines
 * exist on both sides of the change — they are the file's unchanged rows — so
 * the alignment renders them grey and the changed-line totals stay put.
 * @param hunk - the arg-derived hunk to rebuild.
 * @param fileLines - the file's current content lines (the post-image basis).
 */
/**
 * Unique-exact locate: the sole 0-based index where `needle` occurs inside
 * `fileLines`, or null when absent or ambiguous (duplicated content has no
 * single anchor, and anchoring the first occurrence would number or wrap the
 * wrong region).
 */
function locateOnce(needle: readonly string[], fileLines: readonly string[]): number | null {
  if (needle.length === 0) return null
  let at = -1
  for (let i = 0; i + needle.length <= fileLines.length; i++) {
    let matches = true
    for (let j = 0; j < needle.length; j++) {
      if (fileLines[i + j] !== needle[j]) {
        matches = false
        break
      }
    }
    if (!matches) continue
    if (at !== -1) return null
    at = i
  }
  return at === -1 ? null : at
}

/** Wrap the fragment located at `at` with ±{@link BOOST_CONTEXT_LINES} shared
 *  lines, or null when there is no context to add (file edges). */
function wrapWithContext(hunk: DiffHunk, fileLines: readonly string[], at: number): DiffHunk | null {
  const newLines = contentLines(hunk.newText)
  const before = fileLines.slice(Math.max(0, at - BOOST_CONTEXT_LINES), at)
  const afterStart = at + newLines.length
  const after = fileLines.slice(afterStart, Math.min(fileLines.length, afterStart + BOOST_CONTEXT_LINES))
  if (before.length === 0 && after.length === 0) return null
  const oldLines = hunk.oldText === null ? [] : contentLines(hunk.oldText)
  return {
    path: hunk.path,
    oldText: [...before, ...oldLines, ...after].join('\n'),
    newText: [...before, ...newLines, ...after].join('\n'),
  }
}

export function boostHunkWithContext(hunk: DiffHunk, fileLines: readonly string[]): DiffHunk | null {
  const newLines = contentLines(hunk.newText)
  if (newLines.length === 0) return null
  const at = locateOnce(newLines, fileLines)
  if (at === null) return null
  return wrapWithContext(hunk, fileLines, at)
}

/**
 * Best-effort context boost for a hunk list: every arg-derived hunk that still
 * sits in the file's current content gains up to {@link BOOST_CONTEXT_LINES}
 * shared lines per side; everything else (applied wire hunks, unlocatable
 * fragments) passes through untouched. Returns the input list reference when
 * nothing changed, so callers can keep identity-stable renders.
 * @param diffs - the hunk list about to render in an expanded window.
 * @param path - the file path, for the fenced read.
 * @param cwd - the session workspace root fencing the read.
 */
export async function boostEditHunks(
  diffs: readonly DiffHunk[],
  path: string,
  cwd: string | undefined,
): Promise<readonly DiffHunk[]> {
  let hasArg = false
  for (const hunk of diffs) {
    if (isArgHunk(hunk)) {
      hasArg = true
      break
    }
  }
  if (!hasArg) return diffs
  const content = await readCached(path, cwd)
  if (content === null) return diffs
  const fileLines = contentLines(content)
  let changed = false
  const out = diffs.map(hunk => {
    if (!isArgHunk(hunk)) return hunk
    const boosted = boostHunkWithContext(hunk, fileLines)
    if (boosted === null) return hunk
    changed = true
    return boosted
  })
  return changed ? out : diffs
}

/** One expanded window's render material. */
export interface PreparedWindow {
  /** The hunks to render — arg-derived hunks rebuilt with file context
   *  (identity-stable when nothing changed). */
  readonly diffs: readonly DiffHunk[]
  /** Per-hunk numbering basis: bases[k] is the 1-based line of diffs[k]'s
   *  first side line in the CURRENT file, or null when that hunk has no
   *  locatable basis (the window then numbers it window-relatively). */
  readonly bases: readonly (number | null)[]
}

/**
 * Boost + numbering in one cached read — the preparation both row callers run
 * when a window expands: arg-derived hunks gain real file context, and every
 * hunk gets its gutter basis located in the current file. The basis anchors on
 * the hunk's post-image (any hunk with content), on the old side's leading
 * shared context for a deletion-only hunk (the deleted lines themselves are
 * no longer in the file), and resolves free to `1` for a settled wire
 * create/overwrite whose post-image IS the file. Locating is
 * uniqueness-checked and skipped over the alignment budget; every failure
 * mode yields a null basis and the window falls back to window-relative
 * numbers. Returns null only when the host read failed outright (host absent,
 * binary, unreadable).
 */
export async function prepareDiffWindow(
  diffs: readonly DiffHunk[],
  path: string,
  cwd: string | undefined,
): Promise<PreparedWindow | null> {
  const content = await readCached(path, cwd)
  if (content === null) return null
  const fileLines = contentLines(content)
  let changed = false
  const bases = diffs.map((): number | null => null)
  const out = diffs.map((hunk, k) => {
    if (!isArgHunk(hunk) && hunk.oldText === null) {
      bases[k] = 1
      return hunk
    }
    if (contentLines(hunk.newText).length > ALIGN_MAX_SIDE_LINES || contentLines(hunk.oldText ?? '').length > ALIGN_MAX_SIDE_LINES) {
      return hunk
    }
    const newLines = contentLines(hunk.newText)
    if (newLines.length > 0) {
      const at = locateOnce(newLines, fileLines)
      if (at === null) return hunk
      if (isArgHunk(hunk)) {
        const boosted = wrapWithContext(hunk, fileLines, at)
        if (boosted !== null) {
          // The rebuilt hunk opens with up to BOOST_CONTEXT_LINES shared
          // lines lifted from before the fragment.
          bases[k] = at - Math.min(at, BOOST_CONTEXT_LINES) + 1
          changed = true
          return boosted
        }
      }
      // Located even where the booster declined (file-edge flush): the bare
      // hunk still numbers from its real position.
      bases[k] = at + 1
      return hunk
    }
    const oldLines = contentLines(hunk.oldText ?? '')
    const at = locateOnce(oldLines.slice(0, Math.min(3, oldLines.length)), fileLines)
    if (at !== null) bases[k] = at + 1
    return hunk
  })
  return { diffs: changed ? out : diffs, bases }
}
