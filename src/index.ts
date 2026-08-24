/**
 * @dsh-external/dsh-diff-stat — host half.
 *
 * M0 skeleton: presence only. M3/M4 add the fenced read/mutation APIs the
 * client half consumes (files.read, undo, open-with) on this plugin's own
 * namespaced route, following the dsh-file-review fence semantics.
 */
import type { Context } from 'cordis'

export const name = 'dsh-diff-stat'

export function apply(ctx: Context): void {
  ctx.logger?.info?.('[dsh-diff-stat] host half ready')
}
