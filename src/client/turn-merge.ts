/**
 * The PTC half of the turn summary card's data. Code-dispatch sub-calls carry
 * no turn coordinate on the wire, so they never enter the turn accumulator;
 * instead the card joins them from the stock chat tool tree — the 'tool-call'
 * nodes already fold every dispatch into its root call's subCalls by
 * rootCallId. Pure data helpers: no React, no runtime imports, so the
 * alignment check script can exercise them directly.
 */
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'
import { callTimeDiffs, markArgHunks } from './diff-contract.ts'
import type { ChangedFile } from './turn-changes.ts'

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
        if (!sub.isError && (name === 'edit' || name === 'write')) {
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
