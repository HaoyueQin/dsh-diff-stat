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
 *
 * Kernel contract: DeepSeek Harness >= 0.1.2-rc.1. The `uiConversation`
 * event registry, the `tool.call.toolview` keyed slot and the
 * `conversation.chat.turnTail` chain all carry their 0.1.2-rc.1+ shapes
 * (later 0.1.2-rc.x releases touch none of the plugin's surfaces);
 * harnesses before that line need dsh-diff-stat <= 0.1.6.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// `@deepseek-ai/dsh-client-store` sits in devDependencies for TYPE resolution
// only: the published ui-chat/client .d.ts references the store without
// declaring it (its own store entry is a devDependency, stripped on publish),
// so pnpm's isolated layout resolves it from this package's root. Removing it
// breaks typecheck (UseChat degrades to `any`).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { subscribeGlassReady } from './glass.ts'
import { hostCall } from './api.ts'
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

/** Required services: the slot registry, the session directory (cwd for path
 *  copy and snapshot keys), locale, and the conversation event registry. */
export const inject = ['slots', 'sessions', 'locale', 'uiConversation']

/** The tool keys this plugin takes over (the wire tools that emit diff cards).
 *  `str_replace_editor` is the minimal agent preset's editor. */
const MUTATION_TOOLS = ['edit', 'write', 'str_replace_editor'] as const

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

  // Every turn/start asks the host for a file-existence snapshot of the
  // workspace: the undo guard needs to tell a turn's file creation from a
  // write that OVERWROTE a pre-existing file (both carry oldText: null, and
  // the overwritten content is unrecoverable once written). Fire-and-forget:
  // a snapshot that never lands simply makes undo refuse deletions (safe).
  const snapshotFromStart = (definition: typeof turnChangesDefinition): typeof turnChangesDefinition => {
    const baseStart = definition.start
    return {
      ...definition,
      start: (context, match, reader) => {
        const turnNo = (match.event.data as { turn?: unknown }).turn
        if (typeof turnNo === 'number') {
          const list = sessions.list.getSnapshot()
          const sessionId = list.current
          const cwd = sessionId === undefined ? undefined : list.byId[sessionId as SessionId]?.cwd
          if (cwd !== undefined && cwd !== '') {
            void hostCall('snapshot', { cwd, session: sessionId, turn: turnNo })
          }
        }
        return baseStart!(context, match, reader)
      },
    }
  }
  // The conversation event registry is a hard dependency (inject above):
  // cordis waits on it before applying this fiber, so the definition is
  // registered against a live registry on every kernel this build supports.
  ctx.uiConversation.events.register(snapshotFromStart(turnChangesDefinition))
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
