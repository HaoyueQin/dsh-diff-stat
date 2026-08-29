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
import { alignedHunkRows, terminatorOnly, terminatorRows } from './diff-align.ts'
import { pathKey } from './turn-merge.ts'
import css from './diff-window.module.css'

/** One flattened body line and its role. */
interface DiffRow {
  kind: 'path' | 'del' | 'add' | 'ctx' | 'gap'
  text: string
}

/**
 * Flatten hunks into rows plus the footer totals. The totals count exactly
 * the rows the body renders — del/add ops of the same alignment — so the
 * footer, the body's colored rows and the inline badge always agree.
 */
function buildRows(diffs: readonly DiffHunk[]): { rows: readonly DiffRow[]; added: number; removed: number; files: number } {
  const rows: DiffRow[] = []
  const paths = new Set<string>()
  let added = 0
  let removed = 0
  let prevKey: string | undefined
  for (const diff of diffs) {
    // Path grouping follows the same normalized key the card's merge uses,
    // so a "'./a.ts' + 'a.ts'" pair is ONE file here too (showing the first
    // raw path, like the card row does).
    const key = pathKey(diff.path)
    paths.add(key)
    if (key !== prevKey) {
      rows.push({ kind: 'path', text: diff.path })
    } else if (rows[rows.length - 1]?.kind !== 'gap') {
      // Same file again: separate hunks unless the previous hunk's fold
      // already ended in a gap row (two ⋯ lines in a row read as one).
      rows.push({ kind: 'gap', text: '⋯' })
    }
    prevKey = key
    // Empty creation (a file that appeared with no content rows): render one
    // added row so the window and the badge agree on "a new file, 1 line".
    if (diff.oldText === null && diff.newText === '') {
      rows.push({ kind: 'add', text: '' })
      added += 1
      continue
    }
    const newLines = contentLines(diff.newText)
    const oldLines = diff.oldText === null ? [] : contentLines(diff.oldText)
    let aligned = alignedHunkRows(oldLines, newLines)
    if (aligned !== null && terminatorOnly(diff.oldText, diff.newText, oldLines, newLines)) {
      // A trailing-newline-only change: line-equal under the LCS, but a real
      // file change — render the del/add pair, never a bare gap row.
      aligned = terminatorRows(oldLines, newLines)
    }
    if (aligned === null) {
      // Over-budget sides: plain blocks, exactly the pre-alignment rendering;
      // the footer keeps the full block arithmetic to match.
      for (const line of oldLines) rows.push({ kind: 'del', text: line })
      for (const line of newLines) rows.push({ kind: 'add', text: line })
      added += newLines.length
      removed += oldLines.length
    } else {
      // Footer counts the very rows the body draws: no second arithmetic.
      for (const row of aligned) {
        rows.push(row)
        if (row.kind === 'del') removed++
        else if (row.kind === 'add') added++
      }
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
