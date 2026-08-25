/**
 * dsh-diff-stat — browser half.
 *
 * R1: takes over the stock edit/write rows at the keyed atomic Tool view slot
 * (`tool.call.toolview`) with a lower priority — a lower-priority registration
 * shadows a shipped key while mounted and returns automatically on unload, so
 * uninstalling this plugin restores the stock rows with no configuration. The
 * takeover row adds the inline +N −M badge and renders full diffs through the
 * stock DiffBlock; its derivation carries the argument fallback that keeps
 * Code Dispatch (PTC) sub-calls visible.
 *
 * R2: accumulates each Turn's successful file mutations (native views with
 * the same argument fallback) and claims the chat turn-tail chain with a
 * collapsible per-turn summary card.
 */
import type { ClientContext, ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { subscribeGlassReady } from './glass.ts'
import { MutationRow } from './mutation-row.tsx'
import { selectChangedFiles, turnChangesDefinition } from './turn-changes.ts'
import { TurnCard } from './turn-card.tsx'
import { en, NS, zh, type DiffStatKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Turn summary card + inline peek copy. */
    'diff-stat': DiffStatKey
  }
}

/** Required services: the slot registry, the event assembler, the session directory (cwd for path copy), and locale. */
export const inject = ['slots', 'conversationEvents', 'sessions', 'locale']

/** The tool keys this plugin takes over (the wire tools that emit diff cards). */
const MUTATION_TOOLS = ['edit', 'write'] as const

/**
 * Mount the badge rows and the turn summary card.
 * @param ctx - client root context (services arrive via the inject declaration).
 */
export function apply(ctx: ClientContext & { sessions: ISessions }): void {
  const sessions = ctx.sessions
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-diff-stat: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('tool.call.toolview', function* () {
    for (const key of MUTATION_TOOLS) {
      yield ctx.slots.register({
        name: 'tool.call.toolview',
        key,
        priority: -1,
      }, MutationRow)
    }
  })

  // Optional frosted-glass integration: when deepseek-harness-background is
  // installed, every plugin surface joins the unified glass recipe — the diff
  // window, file preview and row IN/OUT card (all paint with
  // --dsw-alias-markdown-code-block, so they register in token mode), plus the
  // per-turn summary card (own literal tint, so it registers in fill mode).
  // The subscription covers both arrival orders AND hot reload: a ready event
  // after a new bridge publication re-registers against the live api. When the
  // bridge never appears the ordinary UI stays exactly as-is.
  ctx.effect(() => {
    let unregister: (() => void) | undefined
    const unsubscribe = subscribeGlassReady((glass) => {
      if (glass.version !== 1) return
      if (glass.bridgeId !== 'deepseek-harness-background') return
      // Re-register on every publication: the previous handle belongs to the
      // superseded bridge (its registry is already gone) and calling it is a
      // safe no-op, while the new registration lands on the live registry.
      unregister?.()
      const offToken = glass.register({
        plugin: 'dsh-diff-stat',
        selectors: ['[data-diff-window]', '[data-diff-stat-peek]', '[data-diff-stat-io]'],
        mode: 'token',
      })
      const offFill = glass.register({
        plugin: 'dsh-diff-stat',
        selectors: ['[data-diff-stat-card]'],
        mode: 'fill',
      })
      unregister = () => {
        offToken()
        offFill()
      }
    })
    return () => {
      unregister?.()
      unsubscribe()
    }
  }, 'dsh-diff-stat: frosted-glass surfaces')

  ctx.conversationEvents.register(turnChangesDefinition)
  // The turnTail chain is first-wins (ascending priority, lower tries
  // first): claiming at -1 puts the summary card ahead of ui-deliverables'
  // produced-files chips; when a turn changed nothing our select returns
  // null and the stock card falls through unchanged.
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    priority: -1,
    select: selectChangedFiles,
    inject: () => ({
      getCwd: (sessionId: string | undefined) => (
        sessionId === undefined ? undefined : sessions.list.getSnapshot().byId[sessionId as SessionId]?.cwd
      ),
      t: t as PropsLocale<typeof NS>['t'],
    }),
  }, TurnCard))
}