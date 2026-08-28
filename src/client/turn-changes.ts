/**
 * Turn-scoped changed-file accumulator for dsh-diff-stat. Client-only and
 * model-free: files and hunks come from the mutation tools' own presentation
 * contract — the applied result view, the call view, or the argument fallback
 * for Code Dispatch (PTC) sub-calls, whose wire events carry no diff views —
 * never from the closing prose. Structure follows the official ui-deliverables
 * turn accumulator (publishes Turn data, renders no view Node of its own).
 */
import type { ConversationMatch, ConversationNodeDefinition, ToolResultNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { DiffHunk } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { mutationHunks, parseArgs } from './diff-contract.ts'
import { claimFor } from './turn-merge.ts'

/** Message-producing event types that can join the model-visible surface
 *  (core's `SurfaceEventType` — byte-identical across the two kernel
 *  generations this build supports). */
const SURFACE_EVENT_TYPES = new Set<string>(['user/message', 'assistant/message', 'tool/result'])

/**
 * Local copy of core's append-origin surface predicate, inlined from
 * `@deepseek-ai/dsh-session/surface` (byte-identical in 0.1.1-rc.2 and
 * 0.1.2-alpha.1). The runtime re-export this module used to import was
 * removed with the runtime package in 0.1.2-alpha.1, and importing the core
 * subpath directly would add a dynamic module-table request the built bundle
 * cannot resolve on older kernels — a pure local copy keeps the bundle
 * self-contained on both. ponytail: if the core predicate ever grows beyond
 * type + `surfaceOp === 'append'`, re-import it and inline at build time.
 */
function isAppendSurfaceEvent(event: { readonly type: string; readonly surfaceOp?: unknown }): boolean {
  return SURFACE_EVENT_TYPES.has(event.type) && event.surfaceOp === 'append'
}

/** One settled mutation's file and hunks, in settlement order. */
interface ChangedEntry {
  readonly seq: number
  readonly path: string
  readonly diffs: readonly DiffHunk[]
}

/** Immutable changed-file facts published against one Turn. */
export interface TurnChangesTurnData {
  readonly changed: readonly ChangedEntry[]
  /** Whether any run_code root call started in this Turn: its edit/write
   *  sub-calls carry no turn coordinate, so the card joins them from the chat
   *  tool tree instead of the accumulator. */
  readonly hasCodeDispatch: boolean
}

declare module '@deepseek-ai/dsh-client-runtime/client' {
  interface ConversationTurnDataMap {
    /** Successful mutation hunks accumulated in this Turn (dsh-diff-stat). */
    'diff-stat': TurnChangesTurnData
  }
}

/** One merged per-file view: same-path hunks appended in settlement order. */
export interface ChangedFile {
  readonly path: string
  readonly diffs: readonly DiffHunk[]
}

interface TurnChangesState extends TurnChangesTurnData {
  readonly turn: number
  readonly calls: ReadonlyMap<string, {
    readonly name: string
    readonly argsRaw: string
  }>
  readonly subCalls: ReadonlySet<string>
}

/**
 * The mutation hunks a settled tool/result carries, in the authoritative
 * order (applied wire hunks from the result's `meta`, then the argument
 * fallback). Errored results are excluded by the caller: a failed mutation
 * has no diff and must not count.
 */
function settledHunks(
  call: { readonly name: string; readonly argsRaw: string } | undefined,
  meta: unknown,
): DiffHunk[] | null {
  if (call === undefined) return null
  return mutationHunks(call.name, call.argsRaw, meta)
}

/**
 * The mutation hunks a PTC `tool/code-dispatch` sub-call carries, derived
 * from its logged arguments (the dispatch bridge records no presentation
 * metadata). Returns null for errored, malformed, or non-mutation dispatches.
 */
function dispatchHunks(data: Record<string, unknown>): DiffHunk[] | null {
  // Official dispatch semantics (ui-conversation childResult): only an
  // explicit true counts as errored; a missing flag is treated as success.
  if (data.isError === true) return null
  if (typeof data.rootCallId !== 'string' || data.rootCallId === '') return null
  if (typeof data.subCallId !== 'string' || data.subCallId === '') return null
  if (typeof data.name !== 'string' || typeof data.arguments !== 'string') return null
  // Argument sanity lives inside callTimeDiffs (via mutationHunks): only the
  // edit/write shapes map, anything else contributes nothing. Dispatch records
  // carry no result meta, so the hunks come from the argument fallback alone.
  return mutationHunks(data.name, data.arguments, null)
}

/**
 * Trailing path segment, the part that identifies the file at a glance.
 * @param path - Slash- or backslash-separated path.
 * @returns The final segment, or the whole string when separator-free.
 */
export function basename(path: string): string {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? path : path.slice(at + 1)
}

/** Loose event view for the wire-only code-dispatch record. */
function codeDispatchData(event: { readonly type: string; readonly data?: unknown }): Record<string, unknown> | null {
  if (event.type !== 'tool/code-dispatch') return null
  return (event.data ?? {}) as Record<string, unknown>
}

/**
 * Files changed by one Turn data value, merged per path — the pure merge
 * lives in turn-merge.ts next to the claim decision it feeds (zero runtime
 * imports there, so the check script can exercise both directly).
 */
export { changesForClosing, claimFor } from './turn-merge.ts'

/**
 * Per-published-data memo of the claimed match. The chain select re-runs on
 * every render, and the slot compares results by identity — returning a fresh
 * array each time would re-render the card forever (each render re-runs the
 * select). The published data object is immutable, so it is a safe cache key.
 */
const selectMemo = new WeakMap<object, Map<number, readonly ChangedFile[] | null>>()

/**
 * Claim the turn-tail chain only when its closing turn changed files.
 * @param owner - Turn-tail owner currency for the closing assistant.
 * @returns Changed files as the component's match, or null to decline before mount.
 */
export function selectChangedFiles(owner: TurnTailOwnerProps): readonly ChangedFile[] | null {
  const data = owner.turn.data.get('diff-stat')
  if (data === undefined) return null
  let bySeq = selectMemo.get(data)
  if (bySeq === undefined) {
    bySeq = new Map()
    selectMemo.set(data, bySeq)
  }
  const cached = bySeq.get(owner.seq)
  if (cached !== undefined) return cached
  const result = claimFor(data, owner.seq)
  bySeq.set(owner.seq, result)
  return result
}

/** The state a matched turn/start begins with. */
function startState(match: ConversationMatch): TurnChangesState {
  if (match.event.type !== 'turn/start') throw new Error('diff-stat changes start requires turn/start')
  return { turn: match.event.data.turn, calls: new Map(), subCalls: new Set(), changed: [], hasCodeDispatch: false }
}

/** One update folded into the state — the engine's update path and the
 *  window fold below share this single function, so both derive identical data. */
function applyUpdateState(state: TurnChangesState, match: ConversationMatch): TurnChangesState {
  if (match.event.type === 'tool/call') {
    if (typeof match.event.data.callId !== 'string' || match.event.data.callId === '') {
      return state
    }
    const calls = new Map(state.calls)
    calls.set(match.event.data.callId, {
      name: String(match.event.data.name ?? ''),
      argsRaw: String(match.event.data.arguments ?? ''),
    })
    return {
      ...state,
      calls,
      hasCodeDispatch: state.hasCodeDispatch || match.event.data.name === 'run_code',
    }
  }
  if (match.event.type === 'tool/result') {
    const result = match.event.data.message.content[0]
    if (result === undefined || result === null) return state
    if (result.isError === true) return state
    const callId = match.event.data.message.source.callId
    if (typeof callId !== 'string' || callId === '') return state
    const call = state.calls.get(callId)
    const hunks = settledHunks(call, match.event.data.meta)
    if (hunks === null || hunks.length === 0) return state
    // Same call settling twice keeps its first settlement; a later edit to
    // the same file is a distinct call and appends naturally.
    const path = hunks[0]?.path
    if (path === undefined) return state
    return {
      ...state,
      changed: [...state.changed, { seq: match.event.seq, path, diffs: hunks }],
    }
  }
  const dispatch = codeDispatchData(match.event)
  if (dispatch !== null) {
    const data = dispatch
    const hunks = dispatchHunks(data)
    if (hunks === null || hunks.length === 0) return state
    // Dedup key is the root+sub pair: replays and duplicate dispatch
    // records must not double-count a file, and equal sub ids under
    // different roots stay distinct.
    const dedupeKey = String(data['rootCallId']) + '\u0000' + String(data['subCallId'])
    if (state.subCalls.has(dedupeKey)) return state
    const subCalls = new Set(state.subCalls)
    subCalls.add(dedupeKey)
    const path = hunks[0]?.path
    if (path === undefined) return state
    return {
      ...state,
      subCalls,
      changed: [...state.changed, { seq: match.event.seq, path, diffs: hunks }],
    }
  }
  return state
}

/**
 * Fold one context's matches into its turn data. The engine only runs a
 * definition's start for events inside the loaded history window, and a
 * session opened mid-turn (history pagination loads the tail page first)
 * reaches update matches with no start and therefore no state; folding the
 * matches directly reconstructs the same data from whatever the window holds
 * (best effort, exactly like the stock produced-files accumulator: a call
 * whose tool/call settled outside the window cannot contribute, and older
 * pages arriving later enlarge the fold).
 */
function foldMatches(matches: readonly ConversationMatch[]): TurnChangesState | undefined {
  let state: TurnChangesState | undefined
  for (const match of matches) {
    if (match.role === 'start') {
      state = startState(match)
      continue
    }
    if (state === undefined) {
      // Window-start match may be any event type; only turn coordinate rides it.
      const turn = (match.event.data as { turn?: unknown }).turn
      if (typeof turn !== 'number') continue
      state = { turn, calls: new Map(), subCalls: new Set(), changed: [], hasCodeDispatch: false }
    }
    state = applyUpdateState(state, match)
  }
  return state
}

/** Turn-local successful mutation accumulator; it publishes no view Node. */
export const turnChangesDefinition: ConversationNodeDefinition<TurnChangesState> = {
  // The assembler requires buildLocationData's key to equal this kind — both
  // are 'diff-stat', which is also the ConversationTurnDataMap key the
  // turnTail select reads.
  kind: 'diff-stat',
  match: (event) => {
    if (event.type === 'turn/start') return { id: String(event.data.turn), role: 'start' }
    if (event.type === 'tool/call') return { id: String(event.data.turn), role: 'update' }
    if (event.type === 'tool/result' && isAppendSurfaceEvent(event)) {
      return { id: String(event.data.turn), role: 'update' }
    }
    const dispatch = codeDispatchData(event)
    if (dispatch !== null) {
      // Dispatch records without a turn coordinate cannot be routed to a
      // Turn context — skip rather than minting an "undefined" context id.
      const turn = dispatch['turn']
      return typeof turn === 'number' ? { id: String(turn), role: 'update' } : null
    }
    return null
  },
  start: (_context, match) => startState(match),
  update: (context, match) => applyUpdateState(context.state, match),
  // Published from the folded matches, not the incremental state: a session
  // opened on a tail page reaches this Definition with update matches only
  // (its turn/start is outside the loaded window), and the engine never runs
  // start/update for those — folding the window's matches recovers the same
  // data and keeps the card visible for turns the window truncates.
  buildLocationData: (context, scope) => {
    if (scope !== 'turn') return null
    const state = foldMatches(context.matches)
    return state === undefined
      ? null
      : {
        kind: 'turn',
        turn: state.turn,
        key: 'diff-stat',
        value: { changed: state.changed, hasCodeDispatch: state.hasCodeDispatch },
      }
  },
}

/** Re-exported for the card: parse args once for the relative-path display. */
export { parseArgs }