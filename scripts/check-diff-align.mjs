// Minimal runnable check for the diff aligner (node scripts/check-diff-align.mjs).
// Requires Node >= 23.6 (native TS type stripping; verified on v24) — older
// LTS versions fail with 'Unknown file extension ".ts"'. No build step,
// no test framework.
import assert from 'node:assert/strict'
import { alignedHunkRows, CONTEXT_LINES } from '../src/client/diff-align.ts'

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

console.log('check-diff-align: all assertions pass (' + CONTEXT_LINES + '-line context)')