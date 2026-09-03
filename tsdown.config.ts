/**
 * tsdown preset for dsh-diff-stat — one `tsdown` run builds both halves.
 *
 * Node half (`lib/index.js`): plain ESM transpile of the host plugin. cordis
 * and @deepseek-ai/dsh-atomic-write stay external (the harness provides them
 * at runtime); node builtins are external via platform: 'node'. Types are
 * checked, not emitted (`pnpm typecheck`, noEmit).
 *
 * Browser half (`lib/client.js`): closure-factory bundle for the harness
 * client-plugin loader. Platform module-table entries stay external;
 * everything else inlines. CSS Modules compile through lightningcss into a
 * <style data-plugin> tag injected at factory execution (removed on unload) —
 * the stock ToolRow stylesheet is vendored verbatim into
 * src/client/tool-row.module.css (the npm ui-tool tarball omits src/) so the
 * takeover row keeps the exact stock chrome.
 * Structure ported from @dsh-external/dsh-diff-viewer's proven preset.
 *
 * lib/ is committed (github: installs), so artifacts must be byte-stable
 * across machines: every bundled module resolves inside the project (npm deps
 * pinned by the lockfile) and comments: false drops preserved source
 * comments, so emitted artifacts carry only project-relative region labels.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'
import type { UserConfig } from 'tsdown'

const require = createRequire(import.meta.url)
const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ID = 'dsh-diff-stat'

/** Host-half packages resolved by the harness at runtime — never inlined. */
const LIB_EXTERNALS = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-atomic-write'] as const

/** Module specifiers the dsh web shell shares into its frozen module table
 *  — exactly the runtime imports the client half makes (imports of a table
 *  entry would throw the purity gate below; listing an unused entry would
 *  silently hide a future accidental import of a shareable module). */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
] as const

/** Externals resolved from the loader module table. */
const CLIENT_EXTERNALS: readonly string[] = [...PLATFORM_MODULES]

/** Inline-safe @deepseek-ai wire layers with no shared runtime identity (the
 *  stock client preset's own INLINE_SAFE policy, narrowed to the pure layers
 *  this bundle actually pulls in): dsh-session's surface predicate, its
 *  dsh-brand branding helpers and the dsh-util-workspace-path display helpers
 *  are pure functions, inlined exactly like the stock ui bundles inline them
 *  — no module-table request, no cross-plugin runtime identity. */
const INLINE_SAFE = /^@deepseek-ai\/dsh-(?:session|brand|util-workspace-path)(?:\/|$)/

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

const libBundle: UserConfig = {
  entry: { index: 'src/index.ts' },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2023',
  dts: false,
  clean: false,
  sourcemap: false,
  // ESM output must land at lib/index.js (the package main), not .mjs.
  fixedExtension: false,
  deps: {
    neverBundle: [...LIB_EXTERNALS],
  },
  outputOptions: {
    // Drop preserved source comments (JSDoc etc.); rolldown's own //#region
    // labels stay but reference only project-relative paths.
    comments: false,
  },
}

const clientBundle: UserConfig = {
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  clean: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  deps: {
    neverBundle: [...CLIENT_EXTERNALS],
    alwaysBundle: (id: string) => !CLIENT_EXTERNALS.includes(id),
    // Inlining every non-table dep (clsx etc.) is the intent; silence the hint.
    onlyBundle: false,
  },
  plugins: [{
    // Bundle purity gate: platform seed entries stay external, every other
    // @deepseek-ai value import is a build error (cross-plugin value imports
    // would inline a duplicate instance or need an unknown table specifier).
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (CLIENT_EXTERNALS.includes(source)) return null
      if (INLINE_SAFE.test(source)) return null
      throw new Error(
        'client bundle purity: "' + source + '" is not a platform module (CLIENT_EXTERNALS), '
        + 'not an inline-safe wire layer (INLINE_SAFE), and not an @deepseek-ai import the '
        + 'bundle inlines by default — cross-plugin value imports are forbidden; collaborate '
        + 'through cordis services',
      )
    },
  }, {
    // Bundled node_modules modules carry ABSOLUTE //#region paths (the parent
    // package location of the build machine) in the emitted artifact; without
    // normalization the committed lib/ differs per checkout, breaking the
    // byte-stable contract and the CI lib-diff gate.
    name: 'dsh-relative-region-labels',
    renderChunk(code: string): string | undefined {
      const root = PROJECT_ROOT.replaceAll('\\', '/')
      let changed = false
      const normalized = code.replace(/#region ([^\n]+)/g, (whole, raw: string) => {
        const norm = raw.replaceAll('\\', '/')
        if (norm.startsWith(root + '/')) {
          changed = true
          return '#region ' + norm.slice(root.length + 1)
        }
        return whole
      })
      return changed ? normalized : undefined
    },
  }, {
    // CSS Modules → hashed class map + one injected <style data-plugin> tag.
    name: 'dsh-css-modules-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      if (importer === undefined) return null
      // All CSS imports in this bundle are project-relative (no alias config);
      // resolving against the importer keeps the virtual id project-relative
      // and the emitted artifact byte-stable across machines.
      const abs = resolve(dirname(importer), source)
      const display = relative(PROJECT_ROOT, abs).replaceAll('\\', '/')
      return CSS_VIRTUAL_PREFIX + display + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const raw = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const fileId = resolve(PROJECT_ROOT, raw)
      this.addWatchFile(fileId)
      const source = await readFile(fileId)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: '[name]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      for (const local of Object.keys(cssExports ?? {}).sort()) classMap[local] = cssExports![local]!.name
      const tagId = PLUGIN_ID + '/' + basename(fileId)
      return [
        'const css = ' + JSON.stringify(code.toString()) + ';',
        'const tagId = ' + JSON.stringify(tagId) + ';',
        "if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {",
        "  const tag = document.createElement('style');",
        '  tag.dataset.plugin = ' + JSON.stringify(PLUGIN_ID) + ';',
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        'export default ' + JSON.stringify(classMap) + ';',
      ].join('\n')
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    // Same comment policy as the node half above.
    comments: false,
    banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    codeSplitting: false,
  },
}

export default [libBundle, clientBundle] satisfies UserConfig[]
