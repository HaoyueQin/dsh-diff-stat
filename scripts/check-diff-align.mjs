// Minimal runnable check for the diff aligner (node scripts/check-diff-align.mjs).
// Requires Node >= 23.6 (native TS type stripping; verified on v24) — older
// LTS versions fail with 'Unknown file extension ".ts"'. No build step,
// no test framework.
import assert from 'node:assert/strict'
import { alignedHunkRows, changedLineCounts, CONTEXT_LINES } from '../src/client/diff-align.ts'
import { diffStats } from '../src/client/diff-contract.ts'
// (terminatorOnly / terminatorRows added in the second import block below)
import {
  EMPTY_CHANGED_FILES, claimFor, changesForClosing, collectDispatchFiles, mergeChangedFiles, pathKey,
} from '../src/client/turn-merge.ts'
import { terminatorOnly, terminatorRows } from '../src/client/diff-align.ts'
import { turnChangesDefinition } from '../src/client/turn-changes.ts'
import { boostHunkWithContext, BOOST_CONTEXT_LINES } from '../src/client/context-boost.ts'
import { callTimeDiffs, isArgHunk, markArgHunks } from '../src/client/diff-contract.ts'
import { classifyCreate, createRefusalError, snapshotProbeFrom } from '../src/undo-plan.ts'

const kinds = rows => rows.map(r => r.kind)
const lines = text => text.split('\n')

// 1. Single-line replacement inside short shared context: fully covered, no gap.
let rows = alignedHunkRows(lines('A\nB\nC\nD\nE\nF'), lines('A\nB\nX\nD\nE\nF'))
assert.deepEqual(kinds(rows), ['ctx', 'ctx', 'del', 'add', 'ctx', 'ctx', 'ctx'])
assert.equal(rows[2].text, 'C')
assert.equal(rows[3].text, 'X')

// 2. A change flanked by long unchanged runs collapses to exactly two gaps;
//    each edge keeps CONTEXT_LINES shared rows next to the change.
const head = Array.from({ length: 6 }, (_, i) => 'S' + i)
const tail = Array.from({ length: 6 }, (_, i) => 'T' + i)
rows = alignedHunkRows([...head, 'OLD', ...tail], [...head, 'NEW', ...tail])
assert.equal(rows.filter(r => r.kind === 'gap').length, 2)
assert.deepEqual(kinds(rows).slice(0, 4), ['gap', 'ctx', 'ctx', 'ctx'])
assert.deepEqual(kinds(rows).slice(4, 6), ['del', 'add'])
assert.deepEqual(rows.slice(1, 4).map(r => r.text), ['S' + (6 - CONTEXT_LINES), 'S' + (6 - CONTEXT_LINES + 1), 'S' + (6 - CONTEXT_LINES + 2)])
assert.deepEqual(rows.slice(-4).map(r => r.text), ['T0', 'T1', 'T2', '\u22ef'])

// 3. Creation (empty old side): pure additions, nothing folded.
rows = alignedHunkRows([], lines('a\nb'))
assert.deepEqual(rows, [{ kind: 'add', text: 'a' }, { kind: 'add', text: 'b' }])

// 4. Wipe (empty new side): pure deletions.
rows = alignedHunkRows(lines('a\nb'), [])
assert.deepEqual(kinds(rows), ['del', 'del'])

// 5. Counts are conserved through the fold: del/add totals equal the block arithmetic.
rows = alignedHunkRows(lines('X\nY\nZ\nc1\nc2\nc3'), lines('P\nQ\nc1\nc2\nc3'))
assert.equal(rows.filter(r => r.kind === 'del').length, 3)
assert.equal(rows.filter(r => r.kind === 'add').length, 2)
assert.deepEqual(rows.slice(-3).map(r => r.text), ['c1', 'c2', 'c3'])

// 6. Over-budget sides bail out (caller falls back to plain blocks).
const big = n => Array.from({ length: n }, (_, i) => 'line' + i)
assert.equal(alignedHunkRows(big(1300), big(1301)), null)

// 6b. The budget boundary itself: exactly ALIGN_MAX_SIDE_LINES aligns, one
//     more line on either side bails out. (ALIGN_MAX is 1200, unexported.)
const atBudget = big(1200)
assert.ok(alignedHunkRows(atBudget, atBudget) !== null)
assert.equal(alignedHunkRows(atBudget, [...atBudget, 'extra']), null)
assert.equal(alignedHunkRows(['extra', ...atBudget], atBudget), null)

// 7. Degenerate identical sides still render (all-context folds to one gap).
rows = alignedHunkRows(lines('a\nb\nc\nd\ne\nf\ng\nh'), lines('a\nb\nc\nd\ne\nf\ng\nh'))
assert.ok(rows.some(r => r.kind === 'gap'))

// 8. Change flush against the tail: no trailing gap; the shared head keeps
//    only the CONTEXT_LINES rows adjacent to the change and folds the rest.
rows = alignedHunkRows(lines('c1\nc2\nc3\nc4\nc5\nOLDTAIL'), lines('c1\nc2\nc3\nc4\nc5\nNEWTAIL'))
assert.deepEqual(kinds(rows), ['gap', 'ctx', 'ctx', 'ctx', 'del', 'add'])
assert.equal(rows[rows.length - 1].text, 'NEWTAIL')

// 9. Insertion (no deletion): shared head/tail stay context.
rows = alignedHunkRows(lines('head\ntail'), lines('head\nmiddle\ntail'))
assert.deepEqual(kinds(rows), ['ctx', 'add', 'ctx'])
assert.equal(rows[1].text, 'middle')

// 10. Two changed runs inside one hunk, close enough that their context
//     windows overlap: they merge into ONE kept run with no gap between.
rows = alignedHunkRows(
  lines('A\nB\nC\nX\nE\nF\nG\nY\nI\nJ'),
  lines('A\nB\nC\nD\nE\nF\nG\nH\nI\nJ'),
)
assert.deepEqual(kinds(rows), ['ctx', 'ctx', 'ctx', 'del', 'add', 'ctx', 'ctx', 'ctx', 'del', 'add', 'ctx', 'ctx'])
assert.ok(!rows.some(r => r.kind === 'gap'))
assert.deepEqual(rows.filter(r => r.kind === 'del').map(r => r.text), ['X', 'Y'])
assert.deepEqual(rows.filter(r => r.kind === 'add').map(r => r.text), ['D', 'H'])

// 11. changedLineCounts — the badge arithmetic — shares the renderer's LCS:
//     shared locator/context lines count nowhere, so badge totals equal the
//     colored rows the expanded window draws.

// 11a. Screenshot case: a 4-line old side with 3 shared lines plus a 2-line
//      insertion reads +2 −0 (the −4 block lines were all context).
let counts = changedLineCounts(
  lines('deps: {\nneverBundle: [...X],\nalwaysInlining: f,\n},'),
  lines('deps: {\nneverBundle: [...X],\nalwaysInlining: f,\n// c\nonlyBundle: false,\n},'),
)
assert.deepEqual(counts, { added: 2, removed: 0 })

// 11b. A middle-line replacement between locator lines (3 old / 2 new) reads +0 −1.
counts = changedLineCounts(lines('a\nb\nc'), lines('a\nc'))
assert.deepEqual(counts, { added: 0, removed: 1 })

// 11c. No shared lines at all: the full block arithmetic.
counts = changedLineCounts(lines('o1\no2\no3'), lines('n1\nn2'))
assert.deepEqual(counts, { added: 2, removed: 3 })

// 11d. Creation and wipe degenerate to one-sided totals.
assert.deepEqual(changedLineCounts([], lines('a\nb')), { added: 2, removed: 0 })
assert.deepEqual(changedLineCounts(lines('a\nb'), []), { added: 0, removed: 2 })

// 11e. Over budget: null — the caller falls back to block arithmetic.
assert.equal(changedLineCounts(big(1300), big(1300)), null)

// 11g. Terminator-only change ("a\n" → "a"): line-equal under the LCS, but
//      a real file change — the badge counts one del + one add, and the
//      window renders an explicit del/add pair instead of a bare gap row.
{
  const hunk = { path: 't.ts', oldText: 'a\n', newText: 'a' }
  assert.deepEqual(diffStats([hunk]), { added: 1, removed: 1 })
  assert.equal(terminatorOnly('a\n', 'a', ['a'], ['a']), true)
  assert.equal(terminatorOnly('a\n', 'b', ['a'], ['b']), false)
  assert.equal(terminatorOnly(null, 'a', [], ['a']), false)
  const rendered = alignedHunkRows(['a'], ['a'])
  assert.ok(rendered !== null)
  assert.equal(rendered.filter(r => r.kind === 'del').length, 0)
  const termRows = terminatorRows(['a'], ['a'])
  assert.deepEqual(termRows, [{ kind: 'del', text: 'a' }, { kind: 'add', text: 'a' }])
  assert.deepEqual(changedLineCounts(['a'], ['a']), { added: 0, removed: 0 })
}

// 11h. Terminator-only ABOVE the alignment budget falls back to the same
//      block arithmetic as the over-budget window (no badge/footer drift).
{
  const bigEqual = Array.from({ length: 1300 }, (_, i) => 'line' + i)
  assert.equal(terminatorOnly(bigEqual.join('\n'), bigEqual.join('\n') + '\n', bigEqual, bigEqual), false)
  const bigHunk = { path: 'big.ts', oldText: bigEqual.join('\n'), newText: bigEqual.join('\n') + '\n' }
  assert.deepEqual(diffStats([bigHunk]), { added: 1300, removed: 1300 })
}

// 11f. diffStats over a mixed hunk list equals the rendered del/add rows
//      (badge, body and footer share one arithmetic).
const hunks = [
  { path: 'f.ts', oldText: 'deps: {\nneverBundle: [...X],\nalwaysInlining: f,\n},', newText: 'deps: {\nneverBundle: [...X],\nalwaysInlining: f,\n// c\nonlyBundle: false,\n},' },
  { path: 'g.ts', oldText: 'a\nb\nc', newText: 'a\nc' },
  { path: 'h.ts', oldText: null, newText: 'fresh\nlines' },
]
let bodyAdd = 0
let bodyDel = 0
for (const hunk of hunks) {
  const rendered = alignedHunkRows(hunk.oldText === null ? [] : lines(hunk.oldText), lines(hunk.newText))
  bodyAdd += rendered.filter(r => r.kind === 'add').length
  bodyDel += rendered.filter(r => r.kind === 'del').length
}
assert.deepEqual(diffStats(hunks), { added: bodyAdd, removed: bodyDel })

// 12. turn-merge — the card's PTC join: dispatch sub-calls fold into per-file
//     entries off the stock tool tree; errored and non-mutation calls count
//     nowhere; merging never mutates its inputs.
const settledSub = (callId, name, argsRaw, isError) => ({
  kind: 'tool-result', seq: 0, time: 0, callId,
  call: { name, argsRaw },
  content: [], isError, callView: null, resultView: null, subCalls: [],
})
const root = {
  kind: 'tool-result', seq: 0, time: 0, callId: 'root',
  call: { name: 'run_code', argsRaw: '{}' },
  content: [], isError: false, callView: null, resultView: null,
  subCalls: [
    settledSub('s1', 'edit', JSON.stringify({ file_path: 'a.ts', old_string: 'x', new_string: 'y' }), false),
    settledSub('s2', 'write', JSON.stringify({ file_path: 'b.ts', content: 'hi\n' }), false),
    settledSub('s3', 'edit', '{}', true),
    settledSub('s4', 'read', '{}', false),
  ],
}
const joined = collectDispatchFiles(root, [])
assert.equal(joined.length, 2)
assert.equal(joined[0].path, 'a.ts')
assert.deepEqual(diffStats(joined[0].diffs), { added: 1, removed: 1 })
assert.equal(joined[1].path, 'b.ts')
assert.deepEqual(diffStats(joined[1].diffs), { added: 1, removed: 0 })

const nativeFiles = [{ path: 'a.ts', diffs: [{ path: 'a.ts', oldText: 'n', newText: 'm' }] }]
const dispatchFiles = [
  { path: 'a.ts', diffs: [{ path: 'a.ts', oldText: 'x', newText: 'y' }] },
  { path: 'c.ts', diffs: [{ path: 'c.ts', oldText: null, newText: 'z' }] },
]
const mergedFiles = mergeChangedFiles(nativeFiles, dispatchFiles)
assert.equal(mergedFiles.length, 2)
assert.equal(mergedFiles[0].path, 'a.ts')
assert.equal(mergedFiles[0].diffs.length, 2)
assert.equal(mergedFiles[1].path, 'c.ts')
assert.equal(nativeFiles[0].diffs.length, 1)
assert.equal(mergeChangedFiles(nativeFiles, []), nativeFiles)

// 13. context-boost — arg hunks gain real file context around the located
//     fragment; anything unlocatable or edge-flush passes through unchanged.
assert.ok(BOOST_CONTEXT_LINES === 3)
// The file lines are the POST-image: the fragment's new side sits in the file
// as it exists after the change (the only state a reader can fetch).
const fileLines = lines('f1\nf2\nf3\nNEW\nf4\nf5\nf6\nf7\nf8')
const argHunk = { path: 'f.ts', oldText: 'OLD', newText: 'NEW' }
markArgHunks([argHunk])
assert.ok(isArgHunk(argHunk))
assert.ok(!isArgHunk({ path: 'f.ts', oldText: 'a', newText: 'b' }))

// 13a. Located: ±3 shared lines wrap both sides; totals stay put (shared
//      lines count nowhere).
const boosted = boostHunkWithContext(argHunk, fileLines)
assert.deepEqual(boosted, {
  path: 'f.ts',
  oldText: 'f1\nf2\nf3\nOLD\nf4\nf5\nf6',
  newText: 'f1\nf2\nf3\nNEW\nf4\nf5\nf6',
})
assert.deepEqual(changedLineCounts(lines(boosted.oldText), lines(boosted.newText)), { added: 1, removed: 1 })

// 13b. Fragment no longer in the file (re-edited since) → null.
assert.equal(boostHunkWithContext({ path: 'f.ts', oldText: 'x', newText: 'gone' }, fileLines), null)

// 13c. Empty post-image (pure deletion) → null.
assert.equal(boostHunkWithContext({ path: 'f.ts', oldText: 'OLD', newText: '' }, fileLines), null)

// 13d. Insertion (oldText null): the shared rows appear on both sides.
const boostedIns = boostHunkWithContext({ path: 'f.ts', oldText: null, newText: 'NEW' }, fileLines)
assert.equal(boostedIns.oldText, 'f1\nf2\nf3\nf4\nf5\nf6')
assert.equal(boostedIns.newText, 'f1\nf2\nf3\nNEW\nf4\nf5\nf6')

// 13e. File edge: context truncates at the boundary but still boosts; the old
//      side keeps the original old_string row plus the shared row.
assert.deepEqual(
  boostHunkWithContext({ path: 'f.ts', oldText: 'f1', newText: 'F1' }, lines('F1\nf2')),
  { path: 'f.ts', oldText: 'f1\nf2', newText: 'F1\nf2' },
)

// 13f. One-line file: no context to add → null (caller keeps the fragment).
assert.equal(boostHunkWithContext({ path: 'f.ts', oldText: 'only', newText: 'ONLY' }, lines('ONLY')), null)

// 13g. callTimeDiffs write accepts the 'path' argument key as a fallback
//      (rowModel parity): the wire write schema carries file_path, but a
//      variant passing path must still derive a diff.
// 13h. Duplicated content has no single anchor: a fragment appearing more
//      than once in the file stays unboosted instead of wrapping the wrong
//      occurrence with context.
assert.equal(
  boostHunkWithContext({ path: 'f.ts', oldText: 'x', newText: 'DUP' }, lines('DUP\nmid\nDUP')),
  null,
)
assert.deepEqual(
  callTimeDiffs('write', JSON.stringify({ path: 'p.md', content: 'abc' })),
  [{ path: 'p.md', oldText: null, newText: 'abc' }],
)
assert.deepEqual(
  callTimeDiffs('write', JSON.stringify({ file_path: 'q.md', content: 'def' })),
  [{ path: 'q.md', oldText: null, newText: 'def' }],
)

// 14. str_replace_editor — the minimal preset's editor maps its commands to
//     the same hunk shapes over path/old_str/new_str/file_text; view is read-only.
const created = callTimeDiffs('str_replace_editor', JSON.stringify({ command: 'create', path: 'n.md', file_text: '# hi\n' }))
assert.deepEqual(created, [{ path: 'n.md', oldText: null, newText: '# hi\n' }])
const replaced = callTimeDiffs('str_replace_editor', JSON.stringify({ command: 'str_replace', path: 'a.py', old_str: 'A', new_str: 'B' }))
assert.deepEqual(replaced, [{ path: 'a.py', oldText: 'A', newText: 'B' }])
const inserted = callTimeDiffs('str_replace_editor', JSON.stringify({ command: 'insert', path: 'a.py', insert_line: 2, new_str: 'added' }))
assert.deepEqual(inserted, [{ path: 'a.py', oldText: null, newText: 'added' }])
assert.equal(callTimeDiffs('str_replace_editor', JSON.stringify({ command: 'view', path: 'a.py' })), null)
assert.equal(callTimeDiffs('str_replace_editor', '{}'), null)

// 14b. collectDispatchFiles picks str_replace_editor sub-calls up too.
const editorRoot = {
  kind: 'tool-result', seq: 0, time: 0, callId: 'root2',
  call: { name: 'run_code', argsRaw: '{}' },
  content: [], isError: false, callView: null, resultView: null,
  subCalls: [settledSub('e1', 'str_replace_editor', JSON.stringify({ command: 'str_replace', path: 'x.py', old_str: 'a', new_str: 'b' }), false)],
}
const joinedEditor = collectDispatchFiles(editorRoot, [])
assert.equal(joinedEditor.length, 1)
assert.equal(joinedEditor[0].path, 'x.py')
assert.deepEqual(diffStats(joinedEditor[0].diffs), { added: 1, removed: 1 })

// 15. claimFor / changesForClosing — the turnTail claim decision: settled
//     entries before the closing seq claim with their files, a run_code turn
//     with nothing surviving claims with an empty match (the card mounts and
//     joins from the tool tree), and a plain empty turn declines.
const dataChanged = { changed: [{ seq: 5, path: 'a.ts', diffs: [{ path: 'a.ts', oldText: 'x', newText: 'y' }] }], hasCodeDispatch: false }
const dataPtc = { changed: [], hasCodeDispatch: true }
const dataEmpty = { changed: [], hasCodeDispatch: false }
assert.deepEqual(claimFor(dataChanged, 100), [{ path: 'a.ts', diffs: [{ path: 'a.ts', oldText: 'x', newText: 'y' }] }])
assert.equal(claimFor(dataChanged, 4), null)
assert.deepEqual(claimFor(dataPtc, 100), [])
assert.equal(claimFor(dataEmpty, 100), null)
assert.equal(claimFor(undefined, 100), null)

// 15b. changesForClosing merges same-path entries in settlement order and
//      drops entries settled after the closing seq.
const mergedTurn = changesForClosing({ changed: [
  { seq: 1, path: 'f.ts', diffs: [{ path: 'f.ts', oldText: 'a', newText: 'b' }] },
  { seq: 2, path: 'f.ts', diffs: [{ path: 'f.ts', oldText: 'c', newText: 'd' }] },
  { seq: 3, path: 'g.ts', diffs: [{ path: 'g.ts', oldText: null, newText: 'z' }] },
  { seq: 9, path: 'late.ts', diffs: [{ path: 'late.ts', oldText: null, newText: 'late' }] },
] }, 5)
assert.equal(mergedTurn.length, 2)
assert.equal(mergedTurn[0].path, 'f.ts')
assert.equal(mergedTurn[0].diffs.length, 2)
assert.equal(mergedTurn[1].path, 'g.ts')

// 16. turn-changes route/fold — the pagination-boundary claim: wire
//     code-dispatch records carry no turn coordinate, so the accumulator
//     learns rootCallId → Turn from the tool/call match and routes the
//     dispatch record to the same Turn; a window that dropped tool/call (and
//     even turn/start) still folds from the engine Location and claims the
//     card (hasCodeDispatch) next to the still-visible inline badge rows.
{
  const turn = 7
  const rootCallId = 'call_00_router:7'
  const callEvent = {
    type: 'tool/call',
    data: { turn, callId: rootCallId, name: 'run_code', arguments: '{}' },
  }
  const dispatchEvent = {
    type: 'tool/code-dispatch',
    data: {
      rootCallId, parentCallId: rootCallId, subCallId: rootCallId + ':code:1',
      name: 'edit', arguments: { file_path: 'a.ts', old_string: 'x', new_string: 'y' },
      isError: false,
    },
  }
  const resultEvent = {
    type: 'tool/result',
    data: { turn, message: { source: { callId: rootCallId }, content: [{ text: 'ok' }] } },
  }
  // Match phase: the tool/call learns the root mapping; the dispatch record
  // (object args, no turn field — the current wire) routes to the same Turn.
  assert.deepEqual(turnChangesDefinition.match(callEvent), { id: String(turn), role: 'update' })
  assert.deepEqual(turnChangesDefinition.match(dispatchEvent), { id: String(turn), role: 'update' })
  // Fold phase: window starts mid-run — no turn/start, no tool/call — the
  // engine Location seeds the turn; dispatch hunks are null on this wire
  // (object args) but the PTC evidence still sets hasCodeDispatch.
  const locationData = turnChangesDefinition.buildLocationData({
    matches: [
      { event: dispatchEvent, role: 'update', location: { kind: 'turn', turn: { turn } } },
      { event: resultEvent, role: 'update', location: { kind: 'turn', turn: { turn } } },
    ],
  }, 'turn')
  assert.ok(locationData !== null)
  assert.equal(locationData.turn, turn)
  assert.equal(locationData.value.hasCodeDispatch, true)
  assert.equal(locationData.value.changed.length, 0)
  // The claim mounts (empty match — the card joins the files from the tree).
  assert.deepEqual(claimFor(locationData.value, 100), EMPTY_CHANGED_FILES)
}

// 17. undo-plan — the turn snapshot tells an overwrite from a creation: a
//     wire write carries oldText: null for BOTH, and deleting on an overwrite
//     destroys a file that pre-existed the turn.
{
  const existed = { has: p => p === 'D:/ws/f.ts' }
  const nothing = { has: () => false }
  assert.equal(classifyCreate(undefined, 'D:/ws/f.ts'), 'unverified')
  assert.equal(classifyCreate(existed, 'D:/ws/f.ts'), 'overwrite')
  assert.equal(classifyCreate(existed, 'D:/ws/g.ts'), 'create')
  assert.equal(classifyCreate(nothing, 'D:/ws/f.ts'), 'create')
  assert.ok(createRefusalError('overwrite').includes('existed before the turn'))
  assert.ok(createRefusalError('unverified').includes('no turn snapshot'))
  // A truncated capture (hit the file cap) proves PRESENCE exactly but not
  // ABSENCE: an unrecorded path must read unverified, never create.
  const truncatedCap = snapshotProbeFrom({ files: new Set(['D:/ws/known.ts']), truncated: true })
  assert.equal(classifyCreate(truncatedCap, 'D:/ws/known.ts'), 'overwrite')
  assert.equal(classifyCreate(truncatedCap, 'D:/ws/missing.ts'), 'unverified')
  const exactCap = snapshotProbeFrom({ files: new Set(['D:/ws/known.ts']), truncated: false })
  assert.equal(classifyCreate(exactCap, 'D:/ws/missing.ts'), 'create')
}

// 12c. pathKey — "./a.ts" / "a\b.ts" / "a/b.ts" collapse to one row while
//      the display path keeps the first-seen original.
assert.equal(pathKey('./a.ts'), 'a.ts')
assert.equal(pathKey('a\\b.ts'), 'a/b.ts')
assert.equal(pathKey('a/b.ts'), 'a/b.ts')
{
  const nativeSplit = [{ path: './f.ts', diffs: [{ path: './f.ts', oldText: 'a', newText: 'b' }] }]
  const dispatchSplit = [{ path: 'f.ts', diffs: [{ path: 'f.ts', oldText: 'b', newText: 'c' }] }]
  const mergedSplit = mergeChangedFiles(nativeSplit, dispatchSplit)
  assert.equal(mergedSplit.length, 1)
  assert.equal(mergedSplit[0].path, './f.ts')
  assert.equal(mergedSplit[0].diffs.length, 2)
}

console.log('check-diff-align: all assertions pass (' + CONTEXT_LINES + '-line context)')