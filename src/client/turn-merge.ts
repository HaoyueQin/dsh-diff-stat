/**
 * Pure data helpers for the turn summary card. Two concerns live here:
 * the chain-claim decision (claimFor — whether a Turn's published data
 * claims the card, including the run_code case whose dispatch sub-calls
 * carry no turn coordinate and are joined from the stock chat tool tree
 * instead, folded into their root call's subCalls by rootCallId), and the
 * per-file merge of native and joined files. No React, no runtime imports,
 * so the alignment check script can exercise them directly.
 */
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'
import { callTimeDiffs, isMutationToolName, markArgHunks } from './diff-contract.ts'
import type { ChangedFile, TurnChangesTurnData } from './turn-changes.ts'

/** Stable empty match: a claimed-but-empty turn renders null, not a remount. */
export const EMPTY_CHANGED_FILES: readonly ChangedFile[] = []

/**
 * Files changed by one Turn data value, merged per path. Same-file entries
 * collapse into one row with hunks appended in settlement order, so a file
 * written and then edited in the same turn reads as one entry with combined
 * +N −M. The Conversation Location index owns turn membership before this
 * runs, so paths cannot spill across turns.
 * @param data - the engine-published diff-stat data for one Turn.
 * @param seq - the closing Assistant seq; later settlements are excluded.
 * @returns Changed files in first-seen order; empty when the turn wrote nothing.
 */
export function changesForClosing(
  data: Readonly<TurnChangesTurnData> | undefined,
  seq = Number.POSITIVE_INFINITY,
): readonly ChangedFile[] {
  if (data === undefined) return []
  const files: ChangedFile[] = []
  const byPath = new Map<string, DiffHunk[]>()
  for (const entry of data.changed) {
    if (entry.seq > seq) continue
    const existing = byPath.get(entry.path)
    if (existing === undefined) {
      const diffs: DiffHunk[] = [...entry.diffs]
      byPath.set(entry.path, diffs)
      files.push({ path: entry.path, diffs })
    } else {
      existing.push(...entry.diffs)
    }
  }
  return files
}

/**
 * The claim decision for one Turn's published data at a closing seq: the
 * changed files when any entry survives the closing-seq filter; a stable
 * empty match when the turn ran run_code (its edit/write sub-calls are joined
 * from the chat tool tree later, and an empty claim must still mount the
 * card); null when there is nothing to show.
 * @param data - the engine-published diff-stat data for one Turn.
 * @param seq - the closing Assistant seq; later settlements are excluded.
 */
export function claimFor(data: TurnChangesTurnData | undefined, seq: number): readonly ChangedFile[] | null {
  const files = changesForClosing(data, seq)
  if (files.length > 0) return files
  return data?.hasCodeDispatch === true ? EMPTY_CHANGED_FILES : null
}

/**
 * Collect the successful edit/write dispatch sub-calls of one root block into
 * per-file entries appended in tree order (same path merges its hunks).
 * Settled blocks only: a still-running sub-call has no settled outcome to
 * count. The callId set dedupes replayed or re-folded trees.
 * @param root - the stock tool tree's root block (running or settled).
 * @param into - the list to append per-file entries to.
 * @returns the same list, for call-site convenience.
 */
export function collectDispatchFiles(root: ToolCallBlock, into: ChangedFile[]): ChangedFile[] {
  const seen = new Set<string>()
  const byPath = new Map<string, DiffHunk[]>()
  const order: string[] = []
  const visit = (block: ToolCallBlock): void => {
    for (const sub of block.subCalls) {
      if (seen.has(sub.callId)) continue
      seen.add(sub.callId)
      if ('kind' in sub) {
        const name = sub.call?.name ?? ''
        if (!sub.isError && isMutationToolName(name)) {
          const hunks = callTimeDiffs(name, sub.call?.argsRaw ?? '')
          if (hunks !== null) {
            markArgHunks(hunks)
            for (const hunk of hunks) {
              const existing = byPath.get(hunk.path)
              if (existing === undefined) {
                byPath.set(hunk.path, [hunk])
                order.push(hunk.path)
              } else {
                existing.push(hunk)
              }
            }
          }
        }
      }
      visit(sub)
    }
  }
  visit(root)
  for (const path of order) into.push({ path, diffs: byPath.get(path) ?? [] })
  return into
}

/**
 * Merge the accumulator's native files with the joined dispatch files, native
 * entries first (both keep first-seen order); same-path hunks append. The
 * inputs are never mutated — merged entries clone their hunk lists.
 * @param native - the turn accumulator's settled native mutation files.
 * @param dispatch - the chat-tool-tree-joined PTC sub-call files.
 * @returns the merged per-file list; a native list reference when dispatch is empty.
 */
export function mergeChangedFiles(
  native: readonly ChangedFile[],
  dispatch: readonly ChangedFile[],
): readonly ChangedFile[] {
  if (dispatch.length === 0) return native
  const out: ChangedFile[] = []
  const byPath = new Map<string, DiffHunk[]>()
  for (const file of native) {
    byPath.set(file.path, [...file.diffs])
    out.push({ path: file.path, diffs: byPath.get(file.path) ?? [] })
  }
  for (const file of dispatch) {
    const existing = byPath.get(file.path)
    if (existing === undefined) {
      byPath.set(file.path, [...file.diffs])
      out.push({ path: file.path, diffs: [...file.diffs] })
    } else {
      existing.push(...file.diffs)
    }
  }
  return out
}
