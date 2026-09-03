/**
 * The per-turn file-change summary card (R2): a collapsible bar at each
 * completed turn's tail — "N 个文件已更改 +X −Y" — expanding to per-file rows
 * (name · directory · +n −m · 审查 · 打开|▾) with inline unified diffs.
 * Files and hunks come from the turn accumulator (turn-changes.ts), never the
 * closing prose; run_code's edit/write dispatch sub-calls carry no turn
 * coordinate on the wire, so the card joins them from the stock chat tool
 * tree (turn-merge.ts) and renders the union. 系统打开 rides the stock
 * openFile opener; the remaining actions (撤销 / 内嵌查看 / 定向打开) arrive
 * with the M4 host half and stay hidden while it is absent.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconChevronDownOutline14, IconChevronRightOutline14,
  IconCopyOutline16, IconFolderOpen16, Menu, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { UseChat } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnLocation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { diffStats } from './diff-contract.ts'
import { basename, type ChangedFile } from './turn-changes.ts'
import { mergeChangedFiles } from './turn-merge.ts'
import { extractDispatchFiles, type TurnJoinCache } from './turn-join.ts'
import { prepareDiffWindow, type PreparedWindow } from './context-boost.ts'
import { NS } from './locales.ts'
import { hostAvailable, hostCall } from './api.ts'
import { FilePeek } from './file-peek.tsx'
import { DiffWindow } from './diff-window.tsx'
import { ExternalLinkIcon, EyeIcon, VSCodeIcon } from './icons.tsx'
import { FileTypeIcon } from './file-type-icon.tsx'
import css from './turn-card.module.css'

/** Directory part of a path, for the muted directory segment of a file row. */
function dirname(path: string): string {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? '' : path.slice(0, at)
}

/** Stable empty match so the join selector returns one reference while idle. */
const EMPTY_FILES: readonly ChangedFile[] = []

/** Full card props: the slot's match plus the owner currency and injected cwd reader. */
export type TurnCardProps = {
  matched: readonly ChangedFile[]
  /** The engine-owned closing Turn; its chat tool tree joins the PTC sub-calls. */
  turn?: TurnLocation | undefined
  /** The owning session; resolves the workspace root for relative-path copy. */
  sessionId?: string | undefined
  /** Read the session workspace root, for relative-path copy. Absent → copy falls back to the absolute path. */
  getCwd?: ((sessionId: string | undefined) => string | undefined) | undefined
  /** Chat-target snapshot reader (slot standard prop); joins the dispatch sub-calls. */
  useChat?: UseChat | undefined
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
export function TurnCard(props: TurnCardProps) {
  const { matched, turn, sessionId, openFile, getCwd, t, useChat } = props
  const [expanded, setExpanded] = useState(false)
  const [openFilePath, setOpenFilePath] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set())
  const [peeked, setPeeked] = useState<ReadonlySet<string>>(() => new Set())
  const [hostReady, setHostReady] = useState(false)
  const [undoState, setUndoState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  // Expanding a file for review runs ONE host read that both rebuilds
  // arg-derived (PTC) fragments with real file context and resolves every
  // hunk's gutter numbering basis; applied wire hunks already carry the host's
  // ±3. Each entry pins the hunk list it was built from, so stale entries
  // self-invalidate; a null window (host read failed) renders the raw hunks
  // with window-relative numbers.
  const [prepared, setPrepared] = useState<ReadonlyMap<string, { input: readonly DiffHunk[]; window: PreparedWindow | null }>>(() => new Map())

  // The PTC half: join this Turn's edit/write dispatch sub-calls from the
  // stock chat tool tree (the accumulator cannot route them — dispatch
  // records carry no turn coordinate). The selector returns the snapshot
  // itself — the only identity-stable choice under uSES's Object.is equality
  // (a fresh array per call would re-render this card forever) — and the
  // extraction (with its cross-snapshot node-identity fingerprint cache)
  // lives in the pure turn-join module (check-turn-join.mjs pins the cache
  // contract), so later turns streaming in the same session cannot re-parse
  // this tree on every chunk.
  const snapshot = useChat === undefined ? undefined : useChat((s) => s)
  const joinCache = useRef<TurnJoinCache | null>(null)
  const dispatchFiles = useMemo(() => {
    if (snapshot === undefined || turn === undefined) return EMPTY_FILES
    // The Chat target snapshot already IS the chat slice: `locations` and
    // `nodes` own the tool tree this Turn's run_code sub-calls live in.
    const joined = extractDispatchFiles(snapshot.locations, snapshot.nodes, turn.turn, joinCache.current)
    joinCache.current = joined.next
    return joined.files
  }, [snapshot, turn])
  const allFiles = useMemo(() => mergeChangedFiles(matched, dispatchFiles), [matched, dispatchFiles])
  const total = useMemo(() => totals(allFiles), [allFiles])
  // Per-file stats off the per-render path: the file list is stable per
  // allFiles, so one DP pass each, memoized (identity-mirrors mutation-row).
  const statsByPath = useMemo(() => {
    const map = new Map<string, { added: number; removed: number }>()
    for (const file of allFiles) map.set(file.path, diffStats(file.diffs))
    return map
  }, [allFiles])
  const cwd = useMemo(() => getCwd?.(sessionId), [getCwd, sessionId])

  // Boost newly reviewed files whose hunks are bare arg fragments; the host
  // read is LRU-cached and best-effort, and unlocatable fragments (since
  // re-edited, truncated reads) simply keep their bare rendering. The list is
  // read through a ref, while the effect keys on the revealed set, the cwd
  // and the allFiles identity: a genuine re-settlement (fresh turn data for
  // the same path) re-prepares the stale entries in place, so an expanded
  // review heals after real edits instead of snapping shut until re-toggle.
  // Each entry records the exact hunk list it was built from; the ref check
  // keeps already-boosted files from re-running, and a null window (host read
  // failed — e.g. the file is being rewritten by the live turn) stays
  // retryable on the next run instead of being pinned as done.
  const allFilesRef = useRef(allFiles)
  allFilesRef.current = allFiles
  const preparedRef = useRef(prepared)
  preparedRef.current = prepared
  useEffect(() => {
    if (revealed.size === 0) return
    let alive = true
    void (async () => {
      for (const path of revealed) {
        const file = allFilesRef.current.find(candidate => candidate.path === path)
        if (file === undefined) continue
        const entry = preparedRef.current.get(path)
        if (entry !== undefined && entry.input === file.diffs && entry.window !== null) continue
        const next = await prepareDiffWindow(file.diffs, path, cwd)
        if (!alive) return
        setPrepared(prev => {
          const map = new Map(prev)
          map.set(path, { input: file.diffs, window: next })
          return map
        })
      }
    })()
    return () => { alive = false }
  }, [revealed, cwd, allFiles])

  // Host half probe: the dependent actions (撤销/内嵌查看/定向打开) stay
  // hidden while the server route is absent.
  useEffect(() => {
    let alive = true
    void hostAvailable().then(available => { if (alive) setHostReady(available) })
    return () => { alive = false }
  }, [])

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
        // The turn coordinate lets the host check its turn-start snapshot
        // before deleting a create-shaped file (an overwrite carries the same
        // null oldText but must never be deleted).
        turn: turn?.turn,
        session: sessionId,
        files: allFiles.map(file => ({
          path: file.path,
          diffs: file.diffs.map(hunk => ({ oldText: hunk.oldText, newText: hunk.newText })),
        })),
      })
      setUndoState(result !== null && result.ok ? 'done' : 'error')
    })()
  }, [undoState, cwd, allFiles])

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
    { id: 'peek', label: t('card.peek'), icon: <EyeIcon /> },
    { id: 'open', label: t('card.openSystem'), icon: <ExternalLinkIcon /> },
    ...(hostReady ? [
      { id: 'explorer', label: t('card.showInExplorer'), icon: <IconFolderOpen16 size={13} /> },
      { id: 'vscode', label: t('card.openInVscode'), icon: <VSCodeIcon /> },
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

  if (allFiles.length === 0) return null

  return (
    <div className={css.card} data-diff-stat-card="">
      <div
        className={css.header}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => { setExpanded(v => !v) }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setExpanded(v => !v)
          }
        }}
      >
        <span className={css.chevron + (expanded ? ' ' + css.chevronOpen : '')} aria-hidden>
          <IconChevronRightOutline14 size={12} />
        </span>
        <span className={css.summary}>{t('card.filesChanged', { count: allFiles.length })}</span>
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
            onClick={event => { event.stopPropagation(); undoTurn() }}
          >
            {undoState === 'busy' ? t('card.undoing') : undoState === 'done' ? t('card.undone') : undoState === 'error' ? t('card.undoFailed') : '↶ ' + t('card.undo')}
          </button>
        )}
      </div>
      {expanded && (
        <div className={css.list}>
          {allFiles.map(file => {
            const name = basename(file.path)
            const dir = dirname(file.path)
            const stats = statsByPath.get(file.path) ?? { added: 0, removed: 0 }
            const revealedFile = revealed.has(file.path)
            const preparedEntry = prepared.get(file.path)
            // Render the prepared window only while it was built from this
            // file's exact hunk list; a stale entry, an in-flight prepare or
            // a failed host read all fall back to the raw hunks (window-
            // relative gutter numbers) so an expanded review never snaps
            // shut on streaming identity churn.
            const preparedWindow = preparedEntry !== undefined
              && preparedEntry.input === file.diffs
              && preparedEntry.window !== null
              ? preparedEntry.window
              : null
            return (
              <div key={file.path} data-diff-stat-file={file.path}>
                <div className={css.fileRow}>
                  <span className={css.fileIcon} aria-hidden><FileTypeIcon path={file.path} /></span>
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
                      className={css.action + ' ' + css.chip + (revealedFile ? ' ' + css.actionActive : '')}
                      onClick={() => { toggleRevealed(file.path) }}
                    >
                      {t('card.review')}
                    </button>
                    <span className={css.openSplit}>
                      <button
                        type="button"
                        className={css.action + ' ' + css.openMain + (peeked.has(file.path) ? ' ' + css.actionActive : '')}
                        title={t('card.peek')}
                        onClick={() => { togglePeeked(file.path) }}
                      >
                        {t('card.open')}
                      </button>
                      <span className={css.openDivider} aria-hidden />
                      <Menu
                        open={openFilePath === file.path}
                        anchor={(
                          <button
                            type="button"
                            className={css.action + ' ' + css.openMore + (openFilePath === file.path ? ' ' + css.actionActive : '')}
                            aria-label={t('card.openMore')}
                            aria-haspopup="menu"
                            aria-expanded={openFilePath === file.path}
                            onClick={() => { setOpenFilePath(current => (current === file.path ? null : file.path)) }}
                          >
                            <IconChevronDownOutline14 size={11} />
                          </button>
                        )}
                        items={menuItems}
                        onSelect={id => { onMenuSelect(id, file.path); setOpenFilePath(null) }}
                        onClose={() => { setOpenFilePath(null) }}
                        align="end"
                        compact
                        portal
                      />
                    </span>
                  </span>
                </div>
                {revealedFile && (
                  <div className={css.diffWrap}>
                    <DiffWindow
                      diffs={preparedWindow !== null ? preparedWindow.diffs : file.diffs}
                      bases={preparedWindow !== null ? preparedWindow.bases : undefined}
                      maxHeight={320}
                    />
                  </div>
                )}
                {peeked.has(file.path) && <FilePeek path={file.path} cwd={cwd} t={t} onClose={() => { togglePeeked(file.path) }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}