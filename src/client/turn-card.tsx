/**
 * The per-turn file-change summary card (R2): a collapsible bar at each
 * completed turn's tail — "N 个文件已更改 +X −Y" — expanding to per-file rows
 * (name · directory · +n −m · 审查 · 打开 ▾ · ∨) with inline unified diffs.
 * Files and hunks come from the turn accumulator (turn-changes.ts), never the
 * closing prose. 系统打开 rides the stock openFile opener; the remaining
 * actions (撤销 / 内嵌查看 / 定向打开) arrive with the M4 host half and stay
 * hidden while it is absent.
 */
import { useCallback, useMemo, useState } from 'react'
import {
  DiffBlock, IconChevronDownOutline14, IconChevronRightOutline14,
  IconCopyOutline16, IconFolderClose16, Menu, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { diffStats } from './diff-contract.ts'
import { basename, type ChangedFile } from './turn-changes.ts'
import css from './turn-card.module.css'

/** Directory part of a path, for the muted directory segment of a file row. */
function dirname(path: string): string {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? '' : path.slice(0, at)
}

/** Full card props: the slot's match plus the owner currency and injected cwd reader. */
export type TurnCardProps = {
  matched: readonly ChangedFile[]
  /** The owning session; resolves the workspace root for relative-path copy. */
  sessionId?: string | undefined
  /** Read the session workspace root, for relative-path copy. Absent → copy falls back to the absolute path. */
  getCwd?: ((sessionId: string | undefined) => string | undefined) | undefined
} & Pick<TurnTailOwnerProps, 'openFile'>

/** Totals across files, for the collapsed bar. */
function totals(files: readonly ChangedFile[]): { added: number; removed: number } {
  let added = 0
  let removed = 0
  for (const file of files) {
    const s = diffStats(file.diffs)
    added += s.added
    removed += s.removed
  }
  return { added, removed }
}

/**
 * The turn-tail summary card.
 * @param props - matched files from the slot select, plus the opener and cwd reader.
 */
export function TurnCard({ matched, sessionId, openFile, getCwd }: TurnCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [openFilePath, setOpenFilePath] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set())
  const total = useMemo(() => totals(matched), [matched])

  const toggleRevealed = useCallback((path: string) => {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const copyPath = useCallback((path: string) => {
    const cwd = getCwd?.(sessionId) ?? ''
    const root = cwd.replace(/[/\\]+$/, '')
    const rel = root !== '' && (path.startsWith(root + '/') || path.startsWith(root + '\\'))
      ? path.slice(root.length + 1)
      : path
    void writeClipboard(rel)
  }, [getCwd, sessionId])

  const menuItems = useMemo(() => [
    { id: 'open', label: '系统打开' },
    { type: 'separator' as const, id: 'sep-copy' },
    { id: 'copy-abs', label: '复制绝对路径', icon: <IconCopyOutline16 size={13} /> },
    { id: 'copy-rel', label: '复制相对路径', icon: <IconCopyOutline16 size={13} /> },
  ], [])

  const onMenuSelect = useCallback((id: string, path: string) => {
    if (id === 'open') openFile(path)
    else if (id === 'copy-abs') void writeClipboard(path)
    else if (id === 'copy-rel') copyPath(path)
  }, [openFile, copyPath])

  if (matched.length === 0) return null

  return (
    <div className={css.card} data-diff-stat-card="">
      <button
        type="button"
        className={css.header}
        onClick={() => { setExpanded(v => !v) }}
        aria-expanded={expanded}
      >
        <span className={css.chevron + (expanded ? ' ' + css.chevronOpen : '')} aria-hidden>
          <IconChevronRightOutline14 size={12} />
        </span>
        <span className={css.summary}>{matched.length} 个文件已更改</span>
        <span className={css.badge} data-diffstat="">
          <span className={css.add}>+{total.added}</span>
          <span className={css.del}>−{total.removed}</span>
        </span>
        {/* 撤销（M4）：host 半的 undo API 就绪后在此接线 */}
      </button>
      {expanded && (
        <div className={css.list}>
          {matched.map(file => {
            const name = basename(file.path)
            const dir = dirname(file.path)
            const stats = diffStats(file.diffs)
            const revealedFile = revealed.has(file.path)
            return (
              <div key={file.path} data-diff-stat-file={file.path}>
                <div className={css.fileRow}>
                  <span className={css.fileIcon} aria-hidden><IconFolderClose16 size={14} /></span>
                  <button
                    type="button"
                    className={css.fileName}
                    title={file.path}
                    onClick={() => { toggleRevealed(file.path) }}
                  >
                    {name}
                  </button>
                  {dir !== '' && <span className={css.dir}>{dir}</span>}
                  <span className={css.rowBadge} data-diffstat="">
                    <span className={css.add}>+{stats.added}</span>
                    <span className={css.del}>−{stats.removed}</span>
                  </span>
                  <span className={css.actions}>
                    <button
                      type="button"
                      className={css.action + (revealedFile ? ' ' + css.actionActive : '')}
                      onClick={() => { toggleRevealed(file.path) }}
                    >
                      审查
                    </button>
                    <Menu
                      open={openFilePath === file.path}
                      anchor={(
                        <button
                          type="button"
                          className={css.action}
                          onClick={() => { setOpenFilePath(current => (current === file.path ? null : file.path)) }}
                        >
                          打开 <IconChevronDownOutline14 size={11} />
                        </button>
                      )}
                      items={menuItems}
                      onSelect={id => { onMenuSelect(id, file.path); setOpenFilePath(null) }}
                      onClose={() => { setOpenFilePath(null) }}
                      align="end"
                      compact
                    />
                    <button
                      type="button"
                      className={css.action + (revealedFile ? ' ' + css.actionActive : '')}
                      aria-label={revealedFile ? '收起差异' : ('展开 ' + name + ' 的差异')}
                      onClick={() => { toggleRevealed(file.path) }}
                    >
                      {revealedFile ? '∧' : '∨'}
                    </button>
                  </span>
                </div>
                {revealedFile && (
                  <div className={css.diffWrap}>
                    <DiffBlock diffs={[...file.diffs]} maxLines={16} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}