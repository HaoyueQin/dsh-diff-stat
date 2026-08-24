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
import { NS } from './locales.ts'
import css from './file-peek.module.css'

/** Same collapse geometry as the stock DiffBlock chat cap. */
const MAX_LINES = 16

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
export function FilePeek({ path, cwd, t }: FilePeekProps) {
  const [state, setState] = useState<PeekState>({ kind: 'loading' })
  const [expanded, setExpanded] = useState(false)

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
    return <div className={css.peek}><div className={css.note}>{t('peek.loading')}</div></div>
  }
  if (state.kind === 'error') {
    return <div className={css.peek}><div className={css.note}>{t('peek.readFailed')}：{state.message}</div></div>
  }
  if (state.kind === 'binary') {
    return <div className={css.peek}><div className={css.note}>{t('peek.binary', { size: state.size })}</div></div>
  }

  const lines = contentLines(state.content)
  const hidden = lines.length - MAX_LINES
  const capped = hidden > 0 && !expanded
  const headLines = Math.ceil(MAX_LINES / 2)
  const tailLines = MAX_LINES - headLines
  const head = capped ? lines.slice(0, headLines) : lines
  const tail = capped ? lines.slice(lines.length - tailLines) : []

  return (
    <div className={css.peek} data-diff-stat-peek="">
      <div className={css.bar}>
        <span>{path}</span>
        <span>{t('peek.bytes', { size: state.size })}{state.truncated ? ' · ' + t('peek.truncated') : ''}</span>
      </div>
      <div className={css.body}>
        {head.map((line, index) => (
          <div key={'h' + String(index)} className={css.line}>{line}</div>
        ))}
        {capped && (
          <button type="button" className={css.expand} aria-expanded={false} onClick={() => { setExpanded(true) }}>
            {t('peek.more', { count: hidden })}
          </button>
        )}
        {tail.map((line, index) => (
          <div key={'t' + String(index)} className={css.line}>{line}</div>
        ))}
        {expanded && hidden > 0 && (
          <button type="button" className={css.expand} aria-expanded onClick={() => { setExpanded(false) }}>
            {t('peek.collapse')}
          </button>
        )}
      </div>
    </div>
  )
}