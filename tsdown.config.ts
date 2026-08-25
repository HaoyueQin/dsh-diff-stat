/**
 * tsdown preset for dsh-diff-stat: a browser half (lib/client.js) wrapped for
 * the harness client-plugin loader. Platform module-table entries stay
 * external; everything else inlines. CSS Modules compile through lightningcss
 * into a <style data-plugin> tag injected at factory execution (removed on
 * unload) — the stock ToolRow stylesheet rides in through the ui-tool package's
 * exported src subpath so the takeover row keeps the exact stock chrome.
 * Structure ported from @dsh-external/dsh-diff-viewer's proven preset.
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

/** Module specifiers the dsh web shell shares into its frozen module table. */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', 'cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
] as const

/** Externals resolved from the loader module table. */
const CLIENT_EXTERNALS: readonly string[] = [...PLATFORM_MODULES, '@deepseek-ai/dsh-client-runtime/client']

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

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
  },
  plugins: [{
    // Bundle purity gate: platform seed entries stay external, every other
    // @deepseek-ai value import is a build error (cross-plugin value imports
    // would inline a duplicate instance or need an unknown table specifier).
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (CLIENT_EXTERNALS.includes(source)) return null
      if (source.startsWith('@deepseek-ai/dsh-client-ui-tool/src/') && source.endsWith('.module.css')) return null
      throw new Error(
        'client bundle purity: "' + source + '" is not a platform module (CLIENT_EXTERNALS) — '
        + 'cross-plugin value imports are forbidden; collaborate through cordis services',
      )
    },
  }, {
    // CSS Modules → hashed class map + one injected <style data-plugin> tag.
    name: 'dsh-css-modules-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      const abs = source.startsWith('@')
        ? source
        : importer !== undefined ? resolve(dirname(importer), source) : source
      const display = source.startsWith('@')
        ? abs
        : relative(PROJECT_ROOT, abs).replaceAll('\\', '/')
      return CSS_VIRTUAL_PREFIX + display + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const raw = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const fileId = raw.startsWith('@') ? require.resolve(raw) : resolve(PROJECT_ROOT, raw)
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
    // Strip bundler comments: the `//#region <module path>` labels embed the
    // checkout-relative dependency path, which differs between machines and
    // would make the committed lib/ non-reproducible. Comments carry no
    // runtime value here, so strip them all for a byte-stable artifact.
    comments: false,
    banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    codeSplitting: false,
  },
}

export default [clientBundle] satisfies UserConfig[]
