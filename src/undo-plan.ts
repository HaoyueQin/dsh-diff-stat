/**
 * Pure create/overwrite classification for the turn undo path. A wire
 * `write` (and str_replace_editor's create/insert) carries `oldText: null`
 * for BOTH a fresh creation and an overwrite of an existing file — the
 * call-time presenter has no access to prior content. The host captures a
 * turn-start snapshot (path existence) so undo can tell them apart: deleting
 * on an overwrite would destroy a file that existed before the turn, and the
 * overwritten content is unrecoverable by the time undo runs.
 *
 * No imports beyond nothing: this module stays plain and testable.
 */

/** Whether one path existed when the owning turn's snapshot was taken. */
export interface SnapshotProbe {
  /** true = existed at snapshot time; false = absent; undefined = no snapshot for this turn. */
  has(path: string): boolean | undefined
}

/** What undo may do with a create-shaped (oldText: null) hunk. */
export type CreateClassification = 'create' | 'overwrite' | 'unverified'

/**
 * Classify one create-shaped hunk against the owning turn's snapshot.
 * @param snapshot - the turn snapshot probe, or undefined when the host holds
 *   none (a history window opened before snapshotting, an evicted turn).
 * @param path - the resolved file path (realpath, exact snapshot basis).
 * @returns `create` — safe to delete; `overwrite` — refused (the file
 *   pre-existed); `unverified` — refused (no evidence either way).
 */
export function classifyCreate(snapshot: SnapshotProbe | undefined, path: string): CreateClassification {
  if (snapshot === undefined) return 'unverified'
  const existed = snapshot.has(path)
  if (existed === undefined) return 'unverified'
  return existed ? 'overwrite' : 'create'
}

/** Human-readable undo refusal for one classification. */
export function createRefusalError(classification: CreateClassification): string {
  if (classification === 'overwrite') return 'file existed before the turn — write replaced it and the prior content cannot be restored; refusing to delete'
  return 'no turn snapshot — cannot verify this file was created (not an overwrite); refusing to delete'
}
