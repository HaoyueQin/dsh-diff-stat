/**
 * Line-level alignment for one diff hunk's two sides: an LCS walk marks the
 * lines both sides share, shared lines become context around each changed
 * run (CONTEXT_LINES per side, the GitHub/GitLab/VS Code convention), and
 * runs of untouched lines farther out collapse into single gap rows.
 * The same LCS walk also feeds changedLineCounts — the badge/footer
 * arithmetic — so numbers and rendered rows share one source of truth.
 * ponytail: the context width is a fixed constant; promote it to plugin
 * config if a real request lands.
 */

/** Unchanged context rows kept on each side of a changed run. */
export const CONTEXT_LINES = 3

/** Above this per-side line count the DP table is skipped and the caller falls back to plain blocks. */
const ALIGN_MAX_SIDE_LINES = 1200

/** Kind of one rendered alignment row ('gap' marks a collapsed run). */
export type AlignedKind = 'del' | 'add' | 'ctx' | 'gap'

/** One aligned output row; `text` is '\u22ef' for gaps. */
export interface AlignedRow {
  kind: AlignedKind
  text: string
}

/** One LCS step between the sides ('ctx' = shared by both). */
interface AlignOp {
  kind: 'del' | 'add' | 'ctx'
  text: string
}

/**
 * Walk the two sides through an LCS dynamic program into a del/add/ctx op
 * stream. Ties prefer deletions first, matching unified diff ordering.
 */
function lcsOps(oldLines: readonly string[], newLines: readonly string[]): AlignOp[] {
  const m = oldLines.length
  const n = newLines.length
  // Trivial sides (create / wipe) need no table: the answer is one-sided.
  if (m === 0) return newLines.map(text => ({ kind: 'add' as const, text }))
  if (n === 0) return oldLines.map(text => ({ kind: 'del' as const, text }))
  const w = n + 1
  const dp = new Uint32Array((m + 1) * w)
  for (let i = m - 1; i >= 0; i--) {
    const row = i * w
    const below = row + w
    const line = oldLines[i]
    for (let j = n - 1; j >= 0; j--) {
      dp[row + j] = line === newLines[j] ? dp[below + j + 1] + 1 : Math.max(dp[below + j], dp[row + j + 1])
    }
  }
  const ops: AlignOp[] = []
  let i = 0
  let j = 0
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      ops.push({ kind: 'ctx', text: oldLines[i] })
      i += 1
      j += 1
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
      ops.push({ kind: 'del', text: oldLines[i] })
      i += 1
    } else {
      ops.push({ kind: 'add', text: newLines[j] })
      j += 1
    }
  }
  while (i < m) {
    ops.push({ kind: 'del', text: oldLines[i] })
    i += 1
  }
  while (j < n) {
    ops.push({ kind: 'add', text: newLines[j] })
    j += 1
  }
  return ops
}

/**
 * Keep changed ops plus CONTEXT_LINES shared rows around them; everything
 * else folds into single gap rows between kept runs.
 */
function collapse(ops: readonly AlignOp[], context: number): AlignedRow[] {
  const keep = new Array<boolean>(ops.length).fill(false)
  for (let k = 0; k < ops.length; k++) {
    if (ops[k].kind === 'ctx') continue
    for (let d = Math.max(0, k - context); d <= Math.min(ops.length - 1, k + context); d++) {
      keep[d] = true
    }
  }
  const rows: AlignedRow[] = []
  let gapping = false
  for (let k = 0; k < ops.length; k++) {
    if (keep[k]) {
      rows.push({ kind: ops[k].kind, text: ops[k].text })
      gapping = false
    } else if (!gapping) {
      rows.push({ kind: 'gap', text: '\u22ef' })
      gapping = true
    }
  }
  return rows
}

/** True changed-line totals between two sides (the rendered del/add rows). */
export interface ChangedCounts {
  readonly added: number
  readonly removed: number
}

/**
 * Count the real changed lines between two sides: the del/add ops of the same
 * LCS walk the renderer uses, so badge totals always equal the colored rows
 * the expanded window draws — shared locator/context lines count nowhere.
 * Returns null when either side exceeds the alignment budget; the caller then
 * falls back to the full block arithmetic (every old line removed, every new
 * line added), matching the over-budget window's plain-block rendering.
 * @param oldLines - the pre-image content lines (empty for creations).
 * @param newLines - the post-image content lines.
 */
export function changedLineCounts(oldLines: readonly string[], newLines: readonly string[]): ChangedCounts | null {
  if (oldLines.length > ALIGN_MAX_SIDE_LINES || newLines.length > ALIGN_MAX_SIDE_LINES) return null
  let added = 0
  let removed = 0
  for (const op of lcsOps(oldLines, newLines)) {
    if (op.kind === 'del') removed++
    else if (op.kind === 'add') added++
  }
  return { added, removed }
}

/**
 * Unified-style rows for one hunk: changed lines with bounded shared-line
 * context and collapsed untouched runs, or null when either side exceeds the
 * alignment budget (caller renders plain blocks instead). Takes content-line
 * arrays so a caller that already split its sides never splits twice.
 * @param oldLines - the pre-image content lines (empty for creations).
 * @param newLines - the post-image content lines.
 */
export function alignedHunkRows(oldLines: readonly string[], newLines: readonly string[]): AlignedRow[] | null {
  if (oldLines.length > ALIGN_MAX_SIDE_LINES || newLines.length > ALIGN_MAX_SIDE_LINES) return null
  return collapse(lcsOps(oldLines, newLines), CONTEXT_LINES)
}