/**
 * The scroll-windowed unified diff: every line renders inside a max-height
 * scrollable pane — short diffs show in full, long diffs scroll — replacing
 * the stock DiffBlock's collapse-the-middle interaction (the product decision
 * for this plugin's surfaces). Row semantics mirror DiffBlock (path header,
 * removed block, added block, └ footer) so both stay visually kin.
 */
import { useMemo } from 'react'
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import { contentLines } from './diff-contract.ts'
import css from './diff-window.module.css'

/** One flattened body line and its role. */
interface DiffRow {
  kind: 'path' | 'del' | 'add' | 'gap'
  text: string
}

/** Flatten hunks into rows plus the footer totals (DiffBlock's arithmetic). */
function buildRows(diffs: readonly DiffHunk[]): { rows: readonly DiffRow[]; added: number; removed: number; files: number } {
  const rows: DiffRow[] = []
  const paths = new Set<string>()
  let added = 0
  let removed = 0
  let prevPath: string | undefined
  for (const diff of diffs) {
    paths.add(diff.path)
    rows.push({ kind: diff.path !== prevPath ? 'path' : 'gap', text: diff.path !== prevPath ? diff.path : '⋯' })
    prevPath = diff.path
    if (diff.oldText !== null) {
      for (const line of contentLines(diff.oldText)) {
        rows.push({ kind: 'del', text: line })
        removed += 1
      }
    }
    for (const line of contentLines(diff.newText)) {
      rows.push({ kind: 'add', text: line })
      added += 1
    }
  }
  return { rows, added, removed, files: paths.size }
}

const ROW_CLASS = {
  path: css.path,
  del: css.del,
  add: css.add,
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
