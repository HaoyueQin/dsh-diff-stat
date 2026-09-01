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
import {
  alignedHunkRows, gutterNumbers, terminatorOnly, terminatorRows,
  type AlignedRow,
} from './diff-align.ts'
import { pathKey } from './turn-merge.ts'
import css from './diff-window.module.css'

/** One flattened body line, its role, and its gutter number. */
interface DiffRow {
  kind: 'path' | 'del' | 'add' | 'ctx' | 'gap'
  text: string
  /** Gutter line number; undefined renders an empty gutter cell. */
  no?: number
}

/**
 * Flatten hunks into rows plus the footer totals. The totals count exactly
 * the rows the body renders — del/add ops of the same alignment — so the
 * footer, the body's colored rows and the inline badge always agree.
 */
function buildRows(diffs: readonly DiffHunk[], bases: readonly (number | null)[] | undefined): { rows: readonly DiffRow[]; added: number; removed: number; files: number } {
  const rows: DiffRow[] = []
  const paths = new Set<string>()
  let added = 0
  let removed = 0
  let prevKey: string | undefined
  for (let hunkIndex = 0; hunkIndex < diffs.length; hunkIndex++) {
    const diff = diffs[hunkIndex]
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
    const base = bases?.[hunkIndex] ?? null
    // The hunk's body rows in unified order, each carrying its 0-based side
    // position so gutterNumbers can turn them into line numbers.
    let body: readonly AlignedRow[]
    if (diff.oldText === null && diff.newText === '') {
      // Empty creation (a file that appeared with no content rows): render one
      // added row so the window and the badge agree on "a new file, 1 line".
      body = [{ kind: 'add', text: '', newIdx: 0 }]
    } else {
      const newLines = contentLines(diff.newText)
      const oldLines = diff.oldText === null ? [] : contentLines(diff.oldText)
      let aligned = alignedHunkRows(oldLines, newLines)
      if (aligned !== null && terminatorOnly(diff.oldText, diff.newText, oldLines, newLines)) {
        // A trailing-newline-only change: line-equal under the LCS, but a real
        // file change — render the del/add pair, never a bare gap row.
        aligned = terminatorRows(oldLines, newLines)
      }
      body = aligned ?? [
        // Over-budget sides: plain blocks, exactly the pre-alignment rendering;
        // the footer keeps the full block arithmetic to match.
        ...oldLines.map((text, oldIdx) => ({ kind: 'del' as const, text, oldIdx })),
        ...newLines.map((text, newIdx) => ({ kind: 'add' as const, text, newIdx })),
      ]
    }
    const nos = gutterNumbers(body, base)
    // Footer counts the very rows the body draws: no second arithmetic.
    for (let r = 0; r < body.length; r++) {
      const row = body[r]
      rows.push({ kind: row.kind, text: row.text, no: nos[r] })
      if (row.kind === 'del') removed++
      else if (row.kind === 'add') added++
    }
  }
  return { rows, added, removed, files: paths.size }
}

const ROW_CLASS = {
  del: css.del,
  add: css.add,
  ctx: css.ctx,
  gap: css.gap,
} as const

/** Full props of the windowed diff. */
export interface DiffWindowProps {
  diffs: readonly DiffHunk[]
  /** Per-hunk numbering basis (see PreparedWindow): bases[k] is the 1-based
   *  line of diffs[k]'s first side line in the current file, or null when that
   *  hunk could not be located — it then numbers window-relatively. Absent
   *  entirely = every hunk numbers window-relatively. */
  bases?: readonly (number | null)[] | undefined
  /** Scroll pane height cap in px; short diffs render at natural height. */
  maxHeight?: number
}

/**
 * Render one or more file hunks in a bounded scroll window.
 * @param props - hunks plus the optional pane height cap (default 320px).
 */
export function DiffWindow({ diffs, bases, maxHeight = 320 }: DiffWindowProps) {
  const { rows, added, removed, files } = useMemo(() => buildRows(diffs, bases), [diffs, bases])
  if (rows.length === 0) return null
  return (
    <div className={css.window} data-diff-window="">
      <div className={css.scroll} style={{ maxHeight }}>
        {rows.map((row, index) =>
          row.kind === 'path' ? (
            <div key={index} className={css.pathBar}>
              <span className={css.pathText}>{row.text}</span>
            </div>
          ) : (
            <div key={index} className={css.line + ' ' + ROW_CLASS[row.kind]}>
              <span className={css.no} aria-hidden>{row.no ?? ''}</span>
              <span className={css.tx}>{row.text}</span>
            </div>
          ),
        )}
      </div>
      <div className={css.footer}>└ +{added} −{removed} · {files} file{files === 1 ? '' : 's'}</div>
    </div>
  )
}
