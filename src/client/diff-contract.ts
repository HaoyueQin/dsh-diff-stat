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

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** Keyed atomic Tool call view (declared by the stock ui-tool chat tree). */
    'tool.call.toolview': { kind: 'keyed'; scope: 'session'; owner: ToolCallOwnerProps }
  }
}

/** Narrow a wire `card:'diff'` view's `diffs` to well-formed hunks (same
 *  validation the stock diff-card model applies). */
function narrowDiffs(diffs: unknown): DiffHunk[] | null {
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
 * Line-count totals over the given hunks, counting every old-side line as
 * removed and every new-side line as added — exactly DiffBlock's own footer
 * arithmetic, so the inline badge never disagrees with the expanded card.
 * @param diffs - the hunks backing the badge.
 * @returns non-negative totals; zeros for an empty list.
 */
export function diffStats(diffs: readonly DiffHunk[]): DiffStats {
  let added = 0
  let removed = 0
  for (const hunk of diffs) {
    if (hunk.oldText !== null) removed += contentLines(hunk.oldText).length
    added += contentLines(hunk.newText).length
  }
  return { added, removed }
}

/**
 * The call-time diff hunks the mutation tools' own `presentCall` derives from
 * their arguments: an edit renders its literal old_string→new_string
 * replacement, a write renders its full content as a create (`oldText: null`,
 * which also represents an overwrite without prior content). Code Dispatch
 * sub-calls never carry a wire view (the dispatch bridge logs no presentation
 * metadata), so this args fallback is the only diff material those cards can
 * render — mirroring what the stock row shows for the same call while running.
 * @param toolName - the wire Tool name ('edit' or 'write').
 * @param argsRaw - the frozen call arguments.
 * @returns the call-time hunks, or null when the tool or its args do not map.
 */
export function callTimeDiffs(toolName: string, argsRaw: string): DiffHunk[] | null {
  const args = parseArgs(argsRaw)
  if (args === undefined) return null
  if (toolName === 'write') {
    const path = stringArg(args, 'file_path')
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
  return null
}

/** The wire Tool name of a frozen call block, when the block still carries it. */
function callToolName(block: ToolCallBlock): string {
  return 'kind' in block ? block.call?.name ?? '' : block.name
}

/**
 * Derive the diff-card props for a tool call, or null when this call is not a
 * diff card (running calls use the call-time diff; settled calls use the
 * applied result hunks, which replace the call-time diff). Unlike the stock
 * model, a settled call without a result view falls back to the call-time
 * args diff — that is the PTC sub-call case this plugin exists to cover.
 * @param block - frozen running or settled call slice.
 * @returns the diff-card props, or null (errored calls stay on the generic path).
 */
export function diffCardModel(block: ToolCallBlock): DiffCardModel | null {
  const toolName = callToolName(block)
  if (!('kind' in block)) {
    // Running: the call view may carry the intended diff; the result is absent.
    const call = block.callView?.card === 'diff' ? block.callView : null
    const diffs = call === null ? null : narrowDiffs(call.diffs)
    if (diffs !== null) return { card: { diffs } }
    // A code-dispatch sub-call has no call view at all; its args still carry
    // the intended change, so the call-time fallback keeps the row a diff card.
    const fallback = callTimeDiffs(toolName, block.argsRaw)
    return fallback === null ? null : { card: { diffs: fallback } }
  }
  // Settled: the result view's applied hunks replace the call-time diff.
  const result = block.resultView?.card === 'diff' ? block.resultView : null
  const diffs = result === null ? null : narrowDiffs(result.diffs)
  if (diffs !== null) return { card: { diffs } }
  // A settled code-dispatch sub-call never carries a result view (the dispatch
  // bridge logs no presentation metadata). Successful mutations fall back to
  // the call-time diff from args; errored ones stay on the generic error path,
  // exactly like the stock row (which surfaces the model-facing error text).
  if (block.isError) return null
  const fallback = callTimeDiffs(toolName, block.call?.argsRaw ?? '')
  return fallback === null ? null : { card: { diffs: fallback } }
}
