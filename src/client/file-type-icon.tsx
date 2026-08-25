/**
 * File-type icons for the turn card's per-file rows: official single-path
 * logos inlined from Simple Icons v9 (CC0, see icon-paths.ts) for common
 * source types, tinted with each ecosystem's GitHub-language-bar accent;
 * anything unmapped keeps the neutral extension-tinted file silhouette.
 */
import { ICON_VIEWBOX, LOGO_PATHS } from './icon-paths.ts'

/** Accent color per icon key (GitHub language colors). */
const ICON_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572a5',
  markdown: '#519aba',
  rust: '#dea584',
  html5: '#e34c26',
  css3: '#663399',
  go: '#00ADD8',
  php: '#4F5D95',
  ruby: '#701516',
  openjdk: '#b07219',
  kotlin: '#A97BFF',
  swift: '#F05138',
  yaml: '#cb171e',
  json: '#cbcb41',
  toml: '#9c4221',
  svelte: '#ff3e00',
  docker: '#2496ED',
}

/** Extension -> icon key. */
const EXT_ICONS: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  py: 'python', pyi: 'python',
  md: 'markdown', markdown: 'markdown',
  rs: 'rust',
  html: 'html5', htm: 'html5', xhtml: 'html5',
  css: 'css3',
  go: 'go', php: 'php', rb: 'ruby',
  java: 'openjdk', kt: 'kotlin', kts: 'kotlin', swift: 'swift',
  yml: 'yaml', yaml: 'yaml',
  json: 'json', jsonc: 'json',
  toml: 'toml',
  svelte: 'svelte',
}

/** Lowercased extension of a path ('' when none); Dockerfile maps to its own key. */
function extOf(path: string): string {
  const base = path.slice(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1)
  if (/^dockerfile(\.\w+)?$/i.test(base)) return '@dockerfile'
  const dot = base.lastIndexOf('.')
  return dot === -1 ? '' : base.slice(dot + 1).toLowerCase()
}

/** The neutral extension-tinted file silhouette (unknown types). */
function FileSilhouette({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 1.5h5.2L12.5 4.8v9.7a1 1 0 0 1-1 1h-7.5a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" fill={color} />
      <path d="M9.2 1.5v3.3h3.3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </svg>
  )
}

/** Full props of the file-type icon. */
export interface FileTypeIconProps {
  path: string
}

/**
 * The icon for one changed file: an inlined brand logo for known types, the
 * tinted silhouette otherwise.
 * @param props - the file path whose extension picks the glyph.
 */
export function FileTypeIcon({ path }: FileTypeIconProps) {
  const ext = extOf(path)
  const icon = ext === '@dockerfile' ? 'docker' : EXT_ICONS[ext]
  const d = icon === undefined ? undefined : LOGO_PATHS[icon]
  if (icon !== undefined && d !== undefined) {
    return (
      <svg width="14" height="14" viewBox={ICON_VIEWBOX} aria-hidden="true">
        <path d={d} fill={ICON_COLORS[icon] ?? 'var(--dsw-alias-label-tertiary)'} />
      </svg>
    )
  }
  return <FileSilhouette color="var(--dsw-alias-label-tertiary)" />
}