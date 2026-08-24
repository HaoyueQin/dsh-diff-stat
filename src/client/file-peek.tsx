/**
 * The bounded inline file view (打开 ▾ → 内嵌查看): the file's text content in
 * a height-capped window with the stock DiffBlock collapse pattern — head
 * ceil(maxLines/2) + tail rest, a "… 其余 N 行" expander, and a 收起 button.
 * Content comes from the host half's fenced files.read; binary and oversized
 * files degrade to explicit notes.
 */
import { useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { hostCall } from './api.ts'
import { CloseIcon } from './icons.tsx'
import { NS } from './locales.ts'
import css from './file-peek.module.css'

/** Split text into content lines (trailing newline is a terminator, not a blank line). */
function contentLines(text: string): readonly string[] {
  if (text === '') return []
  const body = text.endsWith('\n') ? text.slice(0, -1) : text
  return body.split('\n')
}

/** Full props of the bounded file view. */
export type FilePeekProps = {
  path: string
  cwd: string | undefined
  /** Close the pane; the header's × button and the menu toggle both call it. */
  onClose: () => void
} & PropsLocale<typeof NS>

type PeekState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'binary'; readonly size: number }
  | { readonly kind: 'text'; readonly content: string; readonly truncated: boolean; readonly size: number }

/**
 * Fetch and render one file inside the bounded window.
 * @param props - the absolute path plus the session workspace root for the fence.
 */
export function FilePeek({ path, cwd, onClose, t }: FilePeekProps) {
  const [state, setState] = useState<PeekState>({ kind: 'loading' })
  const closeLabel = t('peek.close')

  useEffect(() => {
    let alive = true
    setState({ kind: 'loading' })
    void (async () => {
      const result = await hostCall<{ kind: string; content?: string; truncated?: boolean; size?: number; error?: string }>('files.read', { cwd, path })
      if (!alive) return
      if (result === null) {
        setState({ kind: 'error', message: 'host API 不可用' })
      } else if (result.kind === 'binary') {
        setState({ kind: 'binary', size: result.size ?? 0 })
      } else if (typeof result.content !== 'string') {
        setState({ kind: 'error', message: result.error ?? '读取失败' })
      } else {
        setState({ kind: 'text', content: result.content, truncated: result.truncated === true, size: result.size ?? 0 })
      }
    })()
    return () => { alive = false }
  }, [path, cwd])

  if (state.kind === 'loading') {
    return (
      <div className={css.peek}>
        <div className={css.bar}><span className={css.barText}>{path}</span><button type="button" className={css.close} aria-label={closeLabel} onClick={onClose}><CloseIcon /></button></div>
        <div className={css.note}>{t('peek.loading')}</div>
      </div>
    )
  }
  if (state.kind === 'error') {
    return (
      <div className={css.peek}>
        <div className={css.bar}><span className={css.barText}>{path}</span><button type="button" className={css.close} aria-label={closeLabel} onClick={onClose}><CloseIcon /></button></div>
        <div className={css.note}>{t('peek.readFailed')}：{state.message}</div>
      </div>
    )
  }
  if (state.kind === 'binary') {
    return (
      <div className={css.peek}>
        <div className={css.bar}><span className={css.barText}>{path}</span><button type="button" className={css.close} aria-label={closeLabel} onClick={onClose}><CloseIcon /></button></div>
        <div className={css.note}>{t('peek.binary', { size: state.size })}</div>
      </div>
    )
  }

  // Full content, no collapse: the pane's max-height + scroll IS the bound
  // (the same contract as the diff window).
  const lines = contentLines(state.content)

  return (
    <div className={css.peek} data-diff-stat-peek="">
      <div className={css.bar}>
        <span className={css.barText}>{path}</span>
        <span>{t('peek.bytes', { size: state.size })}{state.truncated ? ' · ' + t('peek.truncated') : ''}</span>
        <button type="button" className={css.close} aria-label={closeLabel} onClick={onClose}><CloseIcon /></button>
      </div>
      <div className={css.body}>
        {lines.map((line, index) => (
          <div key={String(index)} className={css.line}>{line}</div>
        ))}
      </div>
    </div>
  )
}