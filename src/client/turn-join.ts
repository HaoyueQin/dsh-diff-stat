/**
 * The stock-tool-tree join for the turn summary card: the edit/write dispatch
 * sub-calls of one Turn's run_code root, collected from the chat projection's
 * node store (the accumulator cannot route them — wire dispatch records carry
 * no turn coordinate). Pure and React-free, so
 * scripts/check-turn-join.mjs exercises the cache contract directly.
 *
 * The cross-snapshot node-identity fingerprint is the whole point: later
 * turns streaming in the same session rebuild the snapshot object per chunk
 * while THIS turn's tree keeps its node objects (the stock assembler only
 * rebuilds dirty contexts' nodes), so keying the cache on the fingerprint —
 * turn coordinate, node keys, node IDENTITIES — keeps the extracted array
 * (and every hunk identity under it) stable across the stream. A
 * snapshot-object-keyed fast path would re-extract per chunk and hand every
 * merge fresh hunk identities, breaking the card's exact-identity review
 * gate: expanded diffs snapped shut on the next streaming chunk.
 */
import type { ToolCallBlock, ToolChatData } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { ChangedFile } from './turn-changes.ts'
import { collectDispatchFiles } from './turn-merge.ts'

/**
 * Structural faces of the stock chat projection the join reads (the harness
 * >= 0.1.2-rc.1 shape).
 */
export interface TurnJoinStores {
  getTurn: (turn: number) => readonly string[]
  get: (key: string) => unknown
}

/**
 * One settled join fingerprint: the turn coordinate, the node keys it
 * resolved to, the node identities behind them, and the extraction those
 * nodes produced. The card holds this in a ref across renders; the fast path
 * compares against it before re-extracting.
 */
export interface TurnJoinCache {
  turn: number
  keys: readonly string[]
  nodes: readonly unknown[]
  result: readonly ChangedFile[]
}

/**
 * Join one Turn's dispatch sub-call files off the stock chat tool tree, with
 * the cross-snapshot fingerprint cache. Node identities — never the snapshot
 * object — decide the fast path: the same turn coordinate over the same node
 * keys resolving to the same node objects returns the PREVIOUS result array
 * (identity-stable, hunks included); anything else re-extracts and advances
 * the cache. Missing keys and non-tool-call nodes contribute nothing, in
 * stable positions, so the fingerprint comparison stays position-aligned.
 * @param locations - the chat projection's locations face.
 * @param nodesStore - the chat projection's node store face.
 * @param turn - the card's turn coordinate.
 * @param cache - the previous cache (null on first extraction).
 * @returns the (possibly cached) files and the cache to hold for next time.
 */
export function extractDispatchFiles(
  locations: { getTurn(turn: number): readonly string[] },
  nodesStore: { get(key: string): unknown },
  turn: number,
  cache: TurnJoinCache | null,
): { files: readonly ChangedFile[]; next: TurnJoinCache } {
  const keys = locations.getTurn(turn)
  if (cache !== null && cache.turn === turn && cache.keys.length === keys.length) {
    let same = true
    for (let i = 0; i < keys.length; i++) {
      if (cache.keys[i] !== keys[i] || cache.nodes[i] !== nodesStore.get(keys[i])) {
        same = false
        break
      }
    }
    if (same) return { files: cache.result, next: cache }
  }
  const nodes: unknown[] = []
  const files: ChangedFile[] = []
  for (const key of keys) {
    const node = nodesStore.get(key) as { kind?: string; data?: unknown } | undefined
    nodes.push(node)
    if (node === undefined || node.kind !== 'tool-call') continue
    const root = (node.data as ToolChatData | undefined)?.root
    if (root !== undefined) collectDispatchFiles(root as ToolCallBlock, files)
  }
  return { files, next: { turn, keys, nodes, result: files } }
}
