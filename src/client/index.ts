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
import type { ClientContext, ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import { MutationRow } from './mutation-row.tsx'
import { selectChangedFiles, turnChangesDefinition } from './turn-changes.ts'
import { TurnCard } from './turn-card.tsx'

/** Required services: the slot registry, the event assembler, and the session directory (cwd for path copy). */
export const inject = ['slots', 'conversationEvents', 'sessions']

/** The tool keys this plugin takes over (the wire tools that emit diff cards). */
const MUTATION_TOOLS = ['edit', 'write'] as const

/**
 * Mount the badge rows and the turn summary card.
 * @param ctx - client root context (services arrive via the inject declaration).
 */
export function apply(ctx: ClientContext & { sessions: ISessions }): void {
  const sessions = ctx.sessions
  ctx.slots.inject('tool.call.toolview', function* () {
    for (const key of MUTATION_TOOLS) {
      yield ctx.slots.register({
        name: 'tool.call.toolview',
        key,
        priority: -1,
      }, MutationRow)
    }
  })

  ctx.conversationEvents.register(turnChangesDefinition)
  ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
    name: 'conversation.chat.turnTail',
    select: selectChangedFiles,
    inject: () => ({
      getCwd: (sessionId: string | undefined) => (
        sessionId === undefined ? undefined : sessions.list.getSnapshot().byId[sessionId]?.cwd
      ),
    }),
  }, TurnCard))
}