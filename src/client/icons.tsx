/**
 * Inline SVG menu icons for the card's open-with menu (no emoji, no brand
 * asset files): an eye for the inline view, an external-link arrow for the
 * system opener, and a simplified VS Code mark. Stroke inherits currentColor
 * so every icon tracks the theme.
 */
interface IconProps {
  size?: number
}

export function EyeIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="2.1" />
    </svg>
  )
}

export function ExternalLinkIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M6.5 3.5H3.8a1.3 1.3 0 0 0-1.3 1.3v7.4a1.3 1.3 0 0 0 1.3 1.3h7.4a1.3 1.3 0 0 0 1.3-1.3V9.5" />
      <path d="M9.5 2.5h4v4M13.2 2.8 7.8 8.2" />
    </svg>
  )
}

export function VSCodeIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.5 1.2 6.6 5.8 3.6 3.5 2 4.3l2.8 3.7L2 11.7l1.6.8 3-2.3 4.9 4.6 2.5-1.2V2.4l-2.5-1.2Zm.2 3.2v7.2L8.2 8l3.5-3.6Z" />
    </svg>
  )
}

export function CloseIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="m3.5 3.5 9 9m0-9-9 9" />
    </svg>
  )
}
