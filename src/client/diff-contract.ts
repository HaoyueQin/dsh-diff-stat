/**
 * Local toolview contract for dsh-diff-stat: the owner currency the stock
 * ui-tool rows supply at `tool.call.toolview` and the pure diff-card
 * derivation, declared locally so this plugin never imports the stock ui-tool
 * contract (one-way dependency). The `declare module` merge restores the slot
 * key this plugin registers into — the stock ui-tool bundle declares the same
 * row with the same shape, and interface merging accepts the duplicate
 * identical declaration. Adapted from dsh-diff-viewer's proven contract, with
 * one behavioural addition the stock model lacks: the call-time argument
 * fallback (the PTC/code-dispatch path, whose calls carry no wire view).
 */
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'
import { changedLineCounts } from './diff-align.ts'

/** What the stock ui-tool rows pass to the `tool.call.toolview` keyed slots. */
export interface ToolCallOwnerProps {
  /** Tool call identity, stable across running and settled forms. */
  callId: string
  /** Wire Tool name and keyed dispatch value. */
  toolName: string
  /** Frozen running call or settled result node. */
  block: ToolCallBlock
  /** Session workspace root for relative summaries. */
  cwd?: string | undefined
  /** Open a Tool argument path through the Host. */
  openFile: (path: string) => void
  /** Inspect this call in the trajectory view when available. */
  inspect?: (() => void) | undefined
}

/** The derived diff-card material the renderer draws. */
export interface DiffCardModel {
  card: { diffs: DiffHunk[] }
}

/**
 * Arg-derived hunks (the PTC dispatch fallback and running estimates), marked
 * at construction so the context booster can tell them apart from applied
 * wire hunks — the host already bakes ±3 context lines into the latter, while
 * an arg fragment is the bare old_string → new_string slice with no file
 * context at all. Object identity rides the whole render path (hunks are
 * never cloned), so a module-side WeakSet needs no interface change and
 * garbage-collects with its hunks.
 */
const argHunks = new WeakSet<DiffHunk>()

/** Mark every hunk in the list as arg-derived (see {@link isArgHunk}). */
export function markArgHunks(diffs: readonly DiffHunk[]): void {
  for (const hunk of diffs) argHunks.add(hunk)
}

/** Whether this hunk came from the argument fallback (no file context). */
export function isArgHunk(hunk: DiffHunk): boolean {
  return argHunks.has(hunk)
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** Keyed atomic Tool call view (declared by the stock ui-tool chat tree). */
    'tool.call.toolview': { kind: 'keyed'; scope: 'session'; owner: ToolCallOwnerProps }
  }
}

/** Narrow a wire `card:'diff'` view's `diffs` to well-formed hunks (same
 *  validation the stock diff-card model applies). */
export function narrowDiffs(diffs: unknown): DiffHunk[] | null {
  if (!Array.isArray(diffs) || diffs.length === 0) return null
  for (const hunk of diffs) {
    if (hunk === null || typeof hunk !== 'object') return null
    const { path, oldText, newText } = hunk as Record<string, unknown>
    if (typeof path !== 'string' || (oldText !== null && typeof oldText !== 'string') || typeof newText !== 'string') {
      return null
    }
  }
  return diffs as DiffHunk[]
}

/** Parse a frozen `argsRaw` string to an object, or undefined for malformed JSON. */
export function parseArgs(argsRaw: string): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(argsRaw) as unknown
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : undefined
  } catch {
    return undefined
  }
}

/** One string-typed argument of a parsed mutation-tool args object. */
function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  return typeof value === 'string' ? value : undefined
}

/**
 * Split text into content lines with the stock DiffBlock terminator rule:
 * empty text is zero lines and a single trailing newline is a terminator, not
 * an extra blank line. Kept in step with DiffBlock so badge totals agree with
 * what the expanded card draws.
 */
export function contentLines(text: string): readonly string[] {
  if (text === '') return []
  const body = text.endsWith('\n') ? text.slice(0, -1) : text
  return body.split('\n')
}

/** Added/removed line totals over hunks (badge material). */
export interface DiffStats {
  readonly added: number
  readonly removed: number
}

/**
 * Changed-line totals over the given hunks (badge material), on the same
 * basis as the rendered window: each hunk's two sides go through the same
 * LCS alignment the DiffWindow draws, so the badge always equals the
 * colored rows the expanded card shows — locator/context lines shared by
 * both sides render grey and count nowhere. Hunks over the alignment budget
 * fall back to the full block arithmetic (every old line removed, every new
 * line added), matching the over-budget window's plain-block rendering.
 * @param diffs - the hunks backing the badge.
 * @returns non-negative totals; zeros for an empty list.
 */
export function diffStats(diffs: readonly DiffHunk[]): DiffStats {
  let added = 0
  let removed = 0
  for (const hunk of diffs) {
    const newLines = contentLines(hunk.newText)
    const oldLines = hunk.oldText === null ? [] : contentLines(hunk.oldText)
    const counted = changedLineCounts(oldLines, newLines)
    if (counted === null) {
      added += newLines.length
      removed += oldLines.length
    } else {
      added += counted.added
      removed += counted.removed
    }
  }
  return { added, removed }
}

/**
 * Whether a wire Tool name is one of the file-mutation tools this plugin
 * takes over and counts. `str_replace_editor` is the minimal agent preset's
 * editor (command-dispatched: create / str_replace / insert; its read-only
 * `view` maps to no hunks below).
 * @param name - the wire Tool name.
 */
export function isMutationToolName(name: string): boolean {
  return name === 'edit' || name === 'write' || name === 'str_replace_editor'
}

/**
 * The call-time diff hunks the mutation tools' own `presentCall` derives from
 * their arguments: an edit renders its literal old_string→new_string
 * replacement, a write renders its full content as a create (`oldText: null`,
 * which also represents an overwrite without prior content), and the minimal
 * preset's str_replace_editor maps its create/str_replace/insert commands to
 * the same shapes over its `path`/`old_str`/`new_str`/`file_text` arguments
 * (its read-only `view` maps to nothing). Code Dispatch sub-calls never carry
 * a wire view (the dispatch bridge logs no presentation metadata), so this
 * args fallback is the only diff material those cards can render — mirroring
 * what the stock row shows for the same call while running.
 * @param toolName - the wire Tool name ('edit', 'write', or 'str_replace_editor').
 * @param argsRaw - the frozen call arguments.
 * @returns the call-time hunks, or null when the tool or its args do not map.
 */
export function callTimeDiffs(toolName: string, argsRaw: string): DiffHunk[] | null {
  const args = parseArgs(argsRaw)
  if (args === undefined) return null
  if (toolName === 'write') {
    // Same key fallback rowModel applies ('path' vs 'file_path').
    const path = stringArg(args, 'file_path') ?? stringArg(args, 'path')
    const content = stringArg(args, 'content')
    if (path === undefined || content === undefined) return null
    return [{ path, oldText: null, newText: content }]
  }
  if (toolName === 'edit') {
    const path = stringArg(args, 'file_path')
    const oldString = stringArg(args, 'old_string')
    const newString = stringArg(args, 'new_string')
    if (path === undefined || oldString === undefined || newString === undefined) return null
    return [{ path, oldText: oldString || null, newText: newString }]
  }
  if (toolName === 'str_replace_editor') {
    const path = stringArg(args, 'path')
    if (path === undefined) return null
    const command = stringArg(args, 'command')
    if (command === 'create') {
      const fileText = stringArg(args, 'file_text')
      if (fileText === undefined) return null
      return [{ path, oldText: null, newText: fileText }]
    }
    if (command === 'str_replace') {
      const oldString = stringArg(args, 'old_str')
      const newString = stringArg(args, 'new_str')
      if (oldString === undefined || newString === undefined) return null
      return [{ path, oldText: oldString || null, newText: newString }]
    }
    if (command === 'insert') {
      const newString = stringArg(args, 'new_str')
      if (newString === undefined) return null
      return [{ path, oldText: null, newText: newString }]
    }
  }
  return null
}

/** The wire Tool name of a frozen call block, when the block still carries it. */
function callToolName(block: ToolCallBlock): string {
  return 'kind' in block ? block.call?.name ?? '' : block.name
}

/**
 * The `diffs` array of an opaque tool/result `meta` payload, or null. The
 * edit/write tools persist `FsDiffMeta = { diffs: FileDiff[] }` there on both
 * supported kernel generations (0.1.1-rc.2 and 0.1.2-alpha.1 — the harness
 * dropped its presentation view envelope in the latter), making the wire
 * meta the one diff source this plugin can read on both.
 */
function metaDiffs(meta: unknown): unknown {
  if (meta === null || typeof meta !== 'object') return null
  const diffs = (meta as Record<string, unknown>)['diffs']
  return diffs === undefined ? null : diffs
}

/**
 * Derive the diff-card props for a tool call, or null when this call is not a
 * diff card (running calls use the call-time diff; settled calls use the
 * applied result hunks from the wire meta, which replace the call-time diff).
 * Unlike the stock model, a settled call without meta falls back to the
 * call-time args diff — that is the PTC sub-call case this plugin exists to
 * cover.
 * @param block - frozen running or settled call slice.
 * @returns the diff-card props, or null (errored calls stay on the generic path).
 */
export function diffCardModel(block: ToolCallBlock): DiffCardModel | null {
  const toolName = callToolName(block)
  if (!('kind' in block)) {
    // Running: the wire carries no applied diff yet; the args fallback keeps
    // the row a diff card (the stock running row derives from args too).
    // These hunks are always arg fragments — bare old→new slices with no
    // file context — so marking them argHunks is correct on BOTH supported
    // kernel generations: expanding a running row legitimately triggers the
    // context boost (a best-effort read of the mid-write file).
    const fallback = callTimeDiffs(toolName, block.argsRaw)
    if (fallback !== null) markArgHunks(fallback)
    return fallback === null ? null : { card: { diffs: fallback } }
  }
  // Settled: the applied hunks recorded in the result's wire meta.
  const applied = narrowDiffs(metaDiffs(block.meta))
  if (applied !== null) return { card: { diffs: applied } }
  // A settled code-dispatch sub-call carries no meta (the dispatch bridge
  // logs no presentation metadata). Successful mutations fall back to the
  // call-time diff from args; errored ones stay on the generic error path,
  // exactly like the stock row (which surfaces the model-facing error text).
  if (block.isError) return null
  const fallback = callTimeDiffs(toolName, block.call?.argsRaw ?? '')
  if (fallback !== null) markArgHunks(fallback)
  return fallback === null ? null : { card: { diffs: fallback } }
}

/**
 * The diff hunks for one settled mutation, in the authoritative order: the
 * applied hunks from the result's wire `meta`, then the argument fallback
 * (the Code Dispatch path). The order is the documented contract — a window
 * that dropped the call head must still render from meta, and a PTC sub-call
 * with no meta renders from args.
 * @returns the hunks, or null when this call carries no diff material.
 */
export function mutationHunks(
  toolName: string,
  argsRaw: string,
  meta: unknown,
): DiffHunk[] | null {
  const applied = narrowDiffs(metaDiffs(meta))
  if (applied !== null) return applied
  const args = callTimeDiffs(toolName, argsRaw)
  if (args !== null) markArgHunks(args)
  return args
}
