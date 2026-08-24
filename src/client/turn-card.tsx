/**
 * The per-turn file-change summary card (R2): a collapsible bar at each
 * completed turn's tail — "N 个文件已更改 +X −Y" — expanding to per-file rows
 * (name · directory · +n −m · 审查 · 打开 ▾ · ∨) with inline unified diffs.
 * Files and hunks come from the turn accumulator (turn-changes.ts), never the
 * closing prose. 系统打开 rides the stock openFile opener; the remaining
 * actions (撤销 / 内嵌查看 / 定向打开) arrive with the M4 host half and stay
 * hidden while it is absent.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DiffBlock, IconChevronDownOutline14, IconChevronRightOutline14,
  IconCopyOutline16, IconFolderClose16, Menu, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { diffStats } from './diff-contract.ts'
import { basename, type ChangedFile } from './turn-changes.ts'
import { NS, type DiffStatKey } from './locales.ts'
import { hostAvailable, hostCall } from './api.ts'
import { FilePeek } from './file-peek.tsx'
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
} & Pick<TurnTailOwnerProps, 'openFile'> & PropsLocale<typeof NS>

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
export function TurnCard({ matched, sessionId, openFile, getCwd, t }: TurnCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [openFilePath, setOpenFilePath] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set())
  const [peeked, setPeeked] = useState<ReadonlySet<string>>(() => new Set())
  const [hostReady, setHostReady] = useState(false)
  const [undoState, setUndoState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const total = useMemo(() => totals(matched), [matched])

  // Host half probe: the dependent actions (撤销/内嵌查看/定向打开) stay
  // hidden while the server route is absent.
  useEffect(() => {
    let alive = true
    void hostAvailable().then(available => { if (alive) setHostReady(available) })
    return () => { alive = false }
  }, [])

  const cwd = useMemo(() => getCwd?.(sessionId), [getCwd, sessionId])

  const togglePeeked = useCallback((path: string) => {
    setPeeked(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  /** Undo the whole turn: replay every recorded hunk chain in reverse on the host. */
  const undoTurn = useCallback(() => {
    if (undoState === 'busy') return
    setUndoState('busy')
    void (async () => {
      const result = await hostCall<{ ok: boolean }>('undo', {
        cwd,
        files: matched.map(file => ({
          path: file.path,
          diffs: file.diffs.map(hunk => ({ oldText: hunk.oldText, newText: hunk.newText })),
        })),
      })
      setUndoState(result !== null && result.ok ? 'done' : 'error')
    })()
  }, [undoState, cwd, matched])

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
    { id: 'peek', label: t('card.peek') },
    { id: 'open', label: t('card.openSystem') },
    ...(hostReady ? [
      { id: 'explorer', label: t('card.showInExplorer') },
      { id: 'vscode', label: t('card.openInVscode') },
    ] : []),
    { type: 'separator' as const, id: 'sep-copy' },
    { id: 'copy-abs', label: t('card.copyAbs'), icon: <IconCopyOutline16 size={13} /> },
    { id: 'copy-rel', label: t('card.copyRel'), icon: <IconCopyOutline16 size={13} /> },
  ], [hostReady, t])

  const onMenuSelect = useCallback((id: string, path: string) => {
    if (id === 'peek') togglePeeked(path)
    else if (id === 'open') openFile(path)
    else if (id === 'explorer') void hostCall('open-with', { cwd, path, target: 'explorer' })
    else if (id === 'vscode') void hostCall('open-with', { cwd, path, target: 'vscode' })
    else if (id === 'copy-abs') void writeClipboard(path)
    else if (id === 'copy-rel') copyPath(path)
  }, [openFile, copyPath, togglePeeked, cwd])

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
        <span className={css.summary}>{t('card.filesChanged', { count: matched.length })}</span>
        <span className={css.badge} data-diffstat="">
          <span className={css.add}>+{total.added}</span>
          <span className={css.del}>−{total.removed}</span>
        </span>
        {hostReady && (
          <button
            type="button"
            className={css.undo + (undoState === 'done' ? ' ' + css.undoDone : '')}
            disabled={undoState === 'busy' || undoState === 'done'}
            title={undoState === 'error' ? t('card.undoFailedTitle') : t('card.undoTitle')}
            onClick={undoTurn}
          >
            {undoState === 'busy' ? t('card.undoing') : undoState === 'done' ? t('card.undone') : undoState === 'error' ? t('card.undoFailed') : t('card.undo')}
          </button>
        )}
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
                      {t('card.review')}
                    </button>
                    <Menu
                      open={openFilePath === file.path}
                      anchor={(
                        <button
                          type="button"
                          className={css.action}
                          onClick={() => { setOpenFilePath(current => (current === file.path ? null : file.path)) }}
                        >
                          {t('card.open')} <IconChevronDownOutline14 size={11} />
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
                      aria-label={revealedFile ? t('row.collapseDiff') : t('row.expandDiff', { name })}
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
                {peeked.has(file.path) && <FilePeek path={file.path} cwd={cwd} t={t} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}