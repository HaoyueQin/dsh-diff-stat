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
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { MutationRow } from './mutation-row.tsx'

/** Required service: the slot registry. */
export const inject = ['slots']

/** The tool keys this plugin takes over (the wire tools that emit diff cards). */
const MUTATION_TOOLS = ['edit', 'write'] as const

/**
 * Mount the badge rows into the keyed atomic Tool view slot under the
 * mutation tool keys, shadowing the shipped rows at a lower priority.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('tool.call.toolview', function* () {
    for (const key of MUTATION_TOOLS) {
      yield ctx.slots.register({
        name: 'tool.call.toolview',
        key,
        priority: -1,
      }, MutationRow)
    }
  })
}
