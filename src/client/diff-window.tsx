/**
 * The scroll-windowed unified diff: every line renders inside a max-height
 * scrollable pane — short diffs show in full, long diffs scroll — replacing
 * the stock DiffBlock's collapse-the-middle interaction (the product decision
 * for this plugin's surfaces). Each hunk's two sides are LCS-aligned first:
 * shared lines render as context around the change and untouched runs fold
 * into gap rows. Row semantics mirror DiffBlock (path header, removed block,
 * added block, └ footer) so both stay visually kin.
 */
import { useMemo } from 'react'
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import { contentLines } from './diff-contract.ts'
import { alignedHunkRows } from './diff-align.ts'
import css from './diff-window.module.css'

/** One flattened body line and its role. */
interface DiffRow {
  kind: 'path' | 'del' | 'add' | 'ctx' | 'gap'
  text: string
}

/**
 * Flatten hunks into rows plus the footer totals. Totals always use the full
 * block arithmetic (DiffBlock's), so folding never moves the numbers; only
 * the rendered row list is aligned and folded.
 */
function buildRows(diffs: readonly DiffHunk[]): { rows: readonly DiffRow[]; added: number; removed: number; files: number } {
  const rows: DiffRow[] = []
  const paths = new Set<string>()
  let added = 0
  let removed = 0
  let prevPath: string | undefined
  for (const diff of diffs) {
    paths.add(diff.path)
    if (diff.path !== prevPath) {
      rows.push({ kind: 'path', text: diff.path })
    } else if (rows[rows.length - 1]?.kind !== 'gap') {
      // Same file again: separate hunks unless the previous hunk's fold
      // already ended in a gap row (two ⋯ lines in a row read as one).
      rows.push({ kind: 'gap', text: '⋯' })
    }
    prevPath = diff.path
    const newLines = contentLines(diff.newText)
    const oldLines = diff.oldText === null ? [] : contentLines(diff.oldText)
    added += newLines.length
    removed += oldLines.length
    const aligned = alignedHunkRows(oldLines, newLines)
    if (aligned === null) {
      // Over-budget sides: plain blocks, exactly the pre-alignment rendering.
      for (const line of oldLines) rows.push({ kind: 'del', text: line })
      for (const line of newLines) rows.push({ kind: 'add', text: line })
    } else {
      for (const row of aligned) rows.push(row)
    }
  }
  return { rows, added, removed, files: paths.size }
}

const ROW_CLASS = {
  path: css.path,
  del: css.del,
  add: css.add,
  ctx: css.ctx,
  gap: css.gap,
} as const

/** Full props of the windowed diff. */
export interface DiffWindowProps {
  diffs: readonly DiffHunk[]
  /** Scroll pane height cap in px; short diffs render at natural height. */
  maxHeight?: number
}

/**
 * Render one or more file hunks in a bounded scroll window.
 * @param props - hunks plus the optional pane height cap (default 320px).
 */
export function DiffWindow({ diffs, maxHeight = 320 }: DiffWindowProps) {
  const { rows, added, removed, files } = useMemo(() => buildRows(diffs), [diffs])
  if (rows.length === 0) return null
  return (
    <div className={css.window} data-diff-window="">
      <div className={css.scroll} style={{ maxHeight }}>
        {rows.map((row, index) => (
          <div key={index} className={css.line + ' ' + ROW_CLASS[row.kind]}>{row.text}</div>
        ))}
      </div>
      <div className={css.footer}>└ +{added} −{removed} · {files} file{files === 1 ? '' : 's'}</div>
    </div>
  )
}
