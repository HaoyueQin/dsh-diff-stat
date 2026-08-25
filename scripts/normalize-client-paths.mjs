#!/usr/bin/env node
/**
 * Normalize checkout-dependent paths that rolldown bakes into `//#region`
 * comments. The bundled clsx dependency resolves through the build-time
 * symlink into the DSH checkout, so its module id carries the checkout folder
 * name (../deepseek-harness on a dev machine, ../dsh in CI). Comments are the
 * only place this leaks into the artifact; rewrite any
 * `../<checkout>/node_modules/` prefix to a stable token so the committed
 * lib/ is byte-identical no matter where it was built.
 */
import { readFile, writeFile } from 'node:fs/promises'

const file = new URL('../lib/client.js', import.meta.url)
const before = await readFile(file, 'utf8')
const after = before.replace(/\.\.\/[^/\\]+\/node_modules\//g, '../dsh-checkout/node_modules/')
if (after !== before) {
  await writeFile(file, after)
  console.log('normalize-client-paths: rewrote checkout-relative module paths')
} else {
  console.log('normalize-client-paths: nothing to rewrite')
}
