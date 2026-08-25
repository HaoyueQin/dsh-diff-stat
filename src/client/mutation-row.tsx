/**
 * The taken-over mutation row for dsh-diff-stat: a faithful re-implementation
 * of the stock ui-tool FileMutationRow (which composes ToolRow), reusing the
 * STOCK row's own stylesheet and the platform DisclosureRow/StateDot/icon
 * components, so the row looks and behaves exactly like the shipped one. The
 * expanded diff renders through the stock DiffBlock primitive (windowed with
 * its own collapse affordance) rather than a custom viewer.
 *
 * dsh-diff-stat's additions over stock:
 *  - an inline **+N −M** badge at the collapsed row end (visible while running,
 *    from the argument-derived estimate; exact once the result view lands);
 *  - the argument fallback in the diff derivation, so Code Dispatch (PTC)
 *    sub-calls — which carry no wire view — still get a full diff on expand.
 */
import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  DisclosureRow, IconEditOutline16, IconInspectOutline12, StateDot,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ToolCallBlock, ToolResultNode } from '@deepseek-ai/dsh-client-runtime/client'
// The stock row's stylesheet, imported through the package's exported src
// subpath and inlined — the takeover row renders with the exact stock chrome.
import rowCss from '@deepseek-ai/dsh-client-ui-tool/src/client/tool/components/ToolRow.module.css'
import badgeCss from './badge.module.css'
import { DiffWindow } from './diff-window.tsx'
import { diffCardModel, diffStats, parseArgs } from './diff-contract.ts'

/** Row state semantic; colors self-supplied via StateDot. */
type ToolRowState = 'running' | 'ok' | 'error' | 'stopped'
/** Row variant for the mutation tools this plugin owns. */
type ToolRowVariant = 'write' | 'edit'

/** Flatten a settled result's content blocks to display text (stock resultText). */
function resultText(node: ToolResultNode): string {
  const parts: string[] = []
  for (const block of node.content) {
    if (block.type === 'text') parts.push(block.text)
    else parts.push(JSON.stringify(block, null, 2))
  }
  if (parts.length === 0 && node.error !== undefined) {
    parts.push(node.error.name + ': ' + node.error.code)
  }
  return parts.join('\n')
}

function firstLine(text: string): string {
  const nl = text.indexOf('\n')
  return nl === -1 ? text : text.slice(0, nl)
}

/** Derive the row model for the edit/write variants (stock toolRowModel mirror). */
function rowModel(toolName: string, block: ToolCallBlock, cwd?: string): {
  variant: ToolRowVariant
  title: string
  summary: string
  filePath: string | undefined
  body: string | null
  output: string | null
  errorSummary: string | null
  state: ToolRowState
} {
  const variant = (toolName === 'edit' ? 'edit' : 'write') as ToolRowVariant
  const done = 'kind' in block
  const argsRaw = (done ? block.call?.argsRaw : block.argsRaw) ?? ''
  const state: ToolRowState = !done ? 'running'
    : block.error?.code === 'interrupted' ? 'stopped'
      : block.isError ? 'error' : 'ok'
  const parsed = parseArgs(argsRaw)
  const path = parsed !== undefined
    ? (typeof parsed['file_path'] === 'string' && parsed['file_path'] !== '' ? parsed['file_path']
      : typeof parsed['path'] === 'string' ? parsed['path'] : undefined)
    : undefined
  // Workspace-rooted paths display relative to the session cwd (stock rule).
  const rel = (text: string): string => {
    if (cwd === undefined || cwd === '') return text
    const root = cwd.replace(/[/\\]+$/, '')
    if (text.startsWith(root + '/') || text.startsWith(root + '\\')) return text.slice(root.length + 1)
    return text
  }
  const summary = path !== undefined ? rel(path) : firstLine(argsRaw === '' ? block.callId : argsRaw)
  const output = done ? (resultText(block) || null) : null
  return {
    variant,
    title: variant === 'edit' ? 'Edit' : 'Write',
    summary,
    filePath: path,
    body: argsRaw === '' ? null : (parsed !== undefined ? JSON.stringify(parsed, null, 2) : argsRaw),
    output,
    errorSummary: state === 'error' && output !== null ? firstLine(output) : null,
    state,
  }
}

/** Leading-slot state substitution (stock): icon yields to the state semantic. */
function leadingFor(state: ToolRowState, icon: ReactNode): ReactNode {
  switch (state) {
    case 'error': return <StateDot state="error" />
    case 'stopped': return <StateDot state="warning" />
    default: return icon
  }
}

/** Visually hidden run-state label (stock AT requirement). */
function stateStatus(state: ToolRowState): string | null {
  switch (state) {
    case 'running': return 'Running'
    case 'error': return 'Failed'
    case 'stopped': return 'Stopped'
    default: return null
  }
}

/** Full props of the taken-over row (the stock ToolCallOwnerProps currency). */
export interface MutationRowProps {
  callId: string
  toolName: string
  block: ToolCallBlock
  cwd?: string | undefined
  openFile: (path: string) => void
  inspect?: (() => void) | undefined
}

/**
 * The mutation row: stock FileMutationRow chrome (DisclosureRow, state dot,
 * path link, error summary, IN/OUT card), the expanded diff rendered through
 * the stock DiffBlock, and the inline +N −M badge appended to the collapsed
 * summary line.
 * @param props - toolview owner currency.
 */
export function MutationRow({ toolName, block, cwd, openFile, inspect }: MutationRowProps) {
  // Spec: every row starts collapsed; expansion is user-driven only.
  const [expanded, setExpanded] = useState(false)
  const model = rowModel(toolName, block, cwd)
  const diff = diffCardModel(block)
  const diffBody = diff ?? null
  const stats = diffBody !== null && model.state !== 'error' && model.state !== 'stopped'
    ? diffStats(diffBody.card.diffs)
    : null
  const outputText = model.output
  const expandable = model.body !== null || outputText !== null || diffBody !== null
  const open = expanded && expandable
  const status = stateStatus(model.state)
  const failureLine = model.state === 'error' ? model.errorSummary ?? null : null
  const summaryText = failureLine ?? model.summary
  const fileLink = model.filePath !== undefined && failureLine === null
  const toggleExpand = () => { setExpanded(v => !v) }
  const openFilePath = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (model.filePath !== undefined) openFile(model.filePath)
  }
  const fileLinkKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
  }
  return (
    <div className={rowCss.root} data-variant={model.variant} data-tool={toolName} data-state={model.state} data-diff-stat-row="">
      {status !== null && <span className={rowCss.visuallyHidden}>{status}</span>}
      <DisclosureRow
        rowClassName={rowCss.row}
        leadingClassName={rowCss.leading}
        titleClassName={rowCss.title}
        chevronClassName={rowCss.chevron}
        icon={leadingFor(model.state, <IconEditOutline16 size={14} />)}
        title={model.title}
        open={open}
        expandable={expandable}
        expandOnRowClick
        keepContentWhenOpen
        onToggle={toggleExpand}
        collapsedContent={
          <>
            {(summaryText !== '' || stats !== null) && (
              <>
                <span className={rowCss.sep} aria-hidden />
                {fileLink ? (
                  <button type="button" className={clsx(rowCss.fileLink, badgeCss.linkFit)} onClick={openFilePath} onKeyDown={fileLinkKeyDown}>
                    {summaryText}
                  </button>
                ) : (
                  <span className={clsx(rowCss.summary, failureLine !== null && rowCss.errorSummary)}>
                    {summaryText}
                  </span>
                )}
                {stats !== null && (
                  <span className={badgeCss.badge} data-diffstat="" aria-label={(stats.added + ' added, ' + stats.removed + ' removed lines')}>
                    <span className={badgeCss.add}>+{stats.added}</span>
                    <span className={badgeCss.del}>−{stats.removed}</span>
                  </span>
                )}
              </>
            )}
          </>
        }
      >
        <div className={rowCss.bodyWrap}>
          {diffBody !== null
            ? <DiffWindow diffs={diffBody.card.diffs} maxHeight={480} />
            : (
              <>
                {(model.body !== null || outputText !== null) && (
                  <div className={rowCss.ioCard} data-diff-stat-io="">
                    {model.body !== null && (
                      <div className={rowCss.ioSection}>
                        <span className={rowCss.ioLabel}>IN</span>
                        <span className={rowCss.ioText}>{model.body}</span>
                      </div>
                    )}
                    {model.body !== null && outputText !== null && (
                      <span className={rowCss.ioDivider} aria-hidden />
                    )}
                    {outputText !== null && (
                      <div className={rowCss.ioSection}>
                        <span className={rowCss.ioLabel}>OUT</span>
                        <span className={rowCss.ioText} data-error={model.state === 'error' || undefined}>
                          {outputText}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          {inspect !== undefined && (
            <button type="button" className={rowCss.inspectButton} onClick={inspect}>
              <IconInspectOutline12 />
              Inspect
            </button>
          )}
        </div>
      </DisclosureRow>
    </div>
  )
}