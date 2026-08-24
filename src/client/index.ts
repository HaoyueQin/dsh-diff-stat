/**
 * @dsh-external/dsh-diff-stat — browser half.
 *
 * M0 skeleton: boots the bundle through the client-module pipeline
 * (scan → graph → /plugins/<id>/client.js → ModuleLoader.load → apply) and
 * proves it with one console marker. R1 (keyed edit/write toolview takeover)
 * lands in M1; R2 (turnTail summary card) lands in M3.
 */
export function apply(ctx: unknown): void {
  void ctx
  console.info('[dsh-diff-stat] client half booted')
}
