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
  /** true = existed at snapshot time; false = absent; undefined = no snapshot / truncated record (no evidence either way). */
  has(path: string): boolean | undefined
}

/** One captured turn record: the existence set plus the truncated flag. */
export interface SnapshotRecord {
  readonly files: ReadonlySet<string>
  /**
   * True when the capture hit the file cap: recorded paths are exact, but
   * ABSENCE proves nothing — a path omitted only because of the cap would
   * otherwise classify as a create and be deleted.
   */
  readonly truncated: boolean
}

/**
 * Build the probe for one captured record, or undefined when the turn has no
 * snapshot. A truncated record answers undefined for an absent path (the
 * conservative direction: refuse rather than risk deleting a pre-existing
 * file); presence is exact in both cases.
 */
export function snapshotProbeFrom(record: SnapshotRecord | undefined): SnapshotProbe | undefined {
  if (record === undefined) return undefined
  return {
    has: path => record.files.has(path) ? true : record.truncated ? undefined : false,
  }
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
/**
 * True for paths inside a directory the capture deliberately skips (the walk
 * never descends into them for cost, so absence there never proves a
 * creation): .git itself plus any directory named node_modules (dependency
 * trees can nest several levels deep).
 */
function insideSkippedDir(path: string): boolean {
  return /(^|[\\./])(\.git|node_modules)([\\./]|$)/.test(path)
}

export function classifyCreate(snapshot: SnapshotProbe | undefined, path: string): CreateClassification {
  // Skipped-dir paths are never captured: absence in the snapshot proves
  // nothing about them — deleting on such evidence is the one direction this
  // guard must never take.
  if (insideSkippedDir(path)) return 'unverified'
  if (snapshot === undefined) return 'unverified'
  const existed = snapshot.has(path)
  if (existed === undefined) return 'unverified'
  return existed ? 'overwrite' : 'create'
}

/** Human-readable undo refusal for one classification. */
export function createRefusalError(classification: CreateClassification): string {
  if (classification === 'overwrite') return 'file existed before the turn — write replaced it and the prior content cannot be restored; refusing to delete'
  return 'no or incomplete turn snapshot — cannot verify this file was created (not an overwrite); refusing to delete'
}
