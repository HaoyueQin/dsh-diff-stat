// Minimal runnable check for the stock-tool-tree join and its cross-snapshot
// fingerprint cache (node scripts/check-turn-join.mjs). Requires Node >= 23.6
// (native TS type stripping; verified on v24) — no build step, no test
// framework. The cache is the regression surface: its fast path must key on
// the NODE IDENTITIES (stable across streaming chunks, because the stock
// assembler only rebuilds dirty contexts' nodes) — never on the chat snapshot
// object identity (rebuilt per chunk). A snapshot-keyed fast path re-extracts
// every chunk, hands each merge fresh hunk identities, and the card's
// exact-identity review gate snaps expanded diffs shut.
import assert from 'node:assert/strict'
import { extractDispatchFiles } from '../src/client/turn-join.ts'

// A settled run_code root with two mutation sub-calls (edit + write), one
// errored edit and one non-mutation read — the tree the join walks.
const settledSub = (callId, name, argsRaw, isError) => ({
  kind: 'tool-result', seq: 0, time: 0, callId,
  call: { name, argsRaw },
  content: [], isError, callView: null, resultView: null, subCalls: [],
})
const makeRoot = () => ({
  kind: 'tool-result', seq: 0, time: 0, callId: 'root',
  call: { name: 'run_code', argsRaw: '{}' },
  content: [], isError: false, callView: null, resultView: null,
  subCalls: [
    settledSub('s1', 'edit', JSON.stringify({ file_path: 'a.ts', old_string: 'x', new_string: 'y' }), false),
    settledSub('s2', 'write', JSON.stringify({ file_path: 'b.ts', content: 'hi\n' }), false),
    settledSub('s3', 'edit', '{}', true),
    settledSub('s4', 'read', '{}', false),
  ],
})
const toolNode = root => ({ kind: 'tool-call', data: { root } })

// 1. The streaming regression: repeated joins over an UNCHANGED tree must
//    return the same array reference every time — the per-chunk rebuild of
//    the snapshot object is invisible to the join by construction (it only
//    ever sees the resolved locations/nodesStore faces). The snapshot-keyed
//    fast path this cache replaced failed exactly here: fresh array, fresh
//    hunk identities, expanded reviews snapped shut on the next chunk.
{
  const node = toolNode(makeRoot()) // one chat node object, reused across "chunks"
  const locations = { getTurn: t => (t === 3 ? ['k1'] : []) }
  const nodesStore = { get: k => (k === 'k1' ? node : undefined) }
  let cache = null
  const refs = []
  for (let chunk = 0; chunk < 6; chunk++) {
    const joined = extractDispatchFiles(locations, nodesStore, 3, cache)
    cache = joined.next
    refs.push(joined.files)
  }
  for (const files of refs) assert.equal(files, refs[0])
  // The hunk identities under the cached result stay put too (the prepared
  // window's exact-input gate compares these).
  assert.ok(refs[0].length === 2)
  assert.ok(refs[0][0].diffs[0] === refs[5][0].diffs[0])
  assert.deepEqual(refs[0].map(f => f.path), ['a.ts', 'b.ts'])
  // The cache holds what it returned and the fingerprint it decided on.
  assert.equal(cache.result, refs[0])
  assert.deepEqual(cache.keys, ['k1'])
  assert.deepEqual(cache.nodes, [node])
  assert.equal(cache.turn, 3)
}

// 2. Node content change: same key, NEW node object (the stock rebuilt the
//    tree) — fingerprint misses, fresh extraction, cache advances.
{
  const first = toolNode(makeRoot())
  const second = toolNode(makeRoot())
  const locations = { getTurn: () => ['k1'] }
  let nodesStore = { get: k => (k === 'k1' ? first : undefined) }
  const one = extractDispatchFiles(locations, nodesStore, 3, null)
  assert.equal(one.files.length, 2)
  nodesStore = { get: k => (k === 'k1' ? second : undefined) }
  const two = extractDispatchFiles(locations, nodesStore, 3, one.next)
  assert.notEqual(two.files, one.files)
  assert.deepEqual(two.next.nodes, [second])
  assert.deepEqual(two.files.map(f => f.path), ['a.ts', 'b.ts'])
}

// 3. Key-set change: a second tool-call node lands in the turn — miss, and
//    the extraction picks up both roots in key order.
{
  const r1 = toolNode(makeRoot())
  const r2 = toolNode(makeRoot())
  const locations = { getTurn: () => ['k1', 'k2'] }
  const nodesStore = { get: k => (k === 'k1' ? r1 : k === 'k2' ? r2 : undefined) }
  const joined = extractDispatchFiles(locations, nodesStore, 3, null)
  assert.equal(joined.files.length, 4)
  assert.deepEqual(joined.files.map(f => f.path), ['a.ts', 'b.ts', 'a.ts', 'b.ts'])
  assert.deepEqual(joined.next.keys, ['k1', 'k2'])
}

// 4. Turn coordinate change: a different tail's join misses even with
//    identical keys and nodes present (the fingerprint includes the turn).
{
  const rootNode = toolNode(makeRoot())
  const locations = { getTurn: t => (t === 3 || t === 4 ? ['k1'] : []) }
  const nodesStore = { get: k => (k === 'k1' ? rootNode : undefined) }
  const a = extractDispatchFiles(locations, nodesStore, 3, null)
  const b = extractDispatchFiles(locations, nodesStore, 4, a.next)
  assert.notEqual(b.files, a.files)
  assert.equal(b.next.turn, 4)
  // And back on turn 3 with the SAME cache chain: turn 4's cache misses for 3.
  const c = extractDispatchFiles(locations, nodesStore, 3, b.next)
  assert.equal(c.next.turn, 3)
}

// 5. Tree noise: non-tool-call nodes and missing keys contribute nothing (in
//    stable positions, so the fingerprint stays position-aligned), and a turn
//    with no keys yields a stable empty result.
{
  const rootNode = toolNode(makeRoot())
  const locations = { getTurn: () => ['k0', 'k1', 'k-missing'] }
  const nodesStore = { get: k => (k === 'k0' ? { kind: 'assistant', data: {} } : k === 'k1' ? rootNode : undefined) }
  const joined = extractDispatchFiles(locations, nodesStore, 3, null)
  assert.equal(joined.files.length, 2)
  assert.deepEqual(joined.next.nodes, [{ kind: 'assistant', data: {} }, rootNode, undefined])
  const empty = extractDispatchFiles({ getTurn: () => [] }, nodesStore, 3, null)
  assert.deepEqual(empty.files, [])
  const cached = extractDispatchFiles({ getTurn: () => [] }, nodesStore, 3, empty.next)
  assert.equal(cached.files, empty.files) // zero-key fast path holds identity too
}

// 6. Null cache (first extraction after mount) behaves like a miss.
{
  const rootNode = toolNode(makeRoot())
  const joined = extractDispatchFiles({ getTurn: () => ['k1'] }, { get: () => rootNode }, 9, null)
  assert.equal(joined.files.length, 2)
  assert.equal(joined.next.turn, 9)
}

console.log('check-turn-join: all assertions pass (node-identity fingerprint)')
