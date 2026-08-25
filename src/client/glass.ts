/**
 * Frosted-glass bridge consumer for `deepseek-harness-background`.
 *
 * The background plugin publishes an optional third-party registry at
 * `window.__DSH_BACKGROUND_GLASS__` and announces it with a DOM event.
 * Registering our diff window and file preview gives those surfaces the same
 * wet-glass sheen + shared backdrop-filter chain the built-in surfaces get
 * while the wallpaper glass is on. Everything here is zero-dependency and
 * degrades to the ordinary (unchanged) UI when the background plugin is not
 * installed: no global, no event, no registration, no effect.
 *
 * Contract source: deepseek-harness-background docs/GLASS_API.md (v1).
 */

/** One surface spec accepted by BackgroundGlassApi.register. */
export interface GlassSurfaceSpec {
  /** Caller identity, used for diagnostics only (convention: package name). */
  plugin: string
  /** One stable anchor selector, or a list of them (cap 64). */
  selectors: string | readonly string[]
  /**
   * 'token' (default): the panel already paints with an overridden --dsw-*
   * token, only sheen + blur are added. 'fill': the registry also takes over
   * the panel's background-color.
   */
  mode?: 'token' | 'fill'
}

/** The object published at window.__DSH_BACKGROUND_GLASS__. */
export interface BackgroundGlassApi {
  /** Contract version (currently 1). */
  readonly version: 1
  /** Publisher identity — assert before trusting the global. */
  readonly bridgeId: 'deepseek-harness-background'
  /** Whether frosted glass is on right now (wallpaper + panelOpacity < 100%). */
  isActive(): boolean
  /**
   * Register surfaces to receive the unified frosted-glass recipe while the
   * glass is on. Idempotent per (plugin, mode, selector); returns the
   * idempotent unregister handle (the right cleanup for a cordis effect).
   */
  register(spec: GlassSurfaceSpec): () => void
}

const GLASS_GLOBAL = '__DSH_BACKGROUND_GLASS__' as const
const GLASS_EVENT = 'dsh-background-glass:ready' as const

/**
 * Resolve the background plugin's glass api when it becomes available.
 *
 * DSH loads client bundles in no guaranteed order, so both arrival paths are
 * covered: poll the global first, then wait for the ready event. When the
 * bridge never appears (background plugin not installed, or a timeout) the
 * promise resolves `null` and the caller keeps its ordinary UI untouched.
 *
 * @param timeoutMs - how long to wait for the ready event (default 10s).
 * @returns the bridge api, or `null` when unavailable.
 */
export function whenGlassReady(timeoutMs = 10_000): Promise<BackgroundGlassApi | null> {
  const existing = (window as unknown as Record<string, unknown>)[GLASS_GLOBAL] as BackgroundGlassApi | undefined
  if (existing !== undefined) return Promise.resolve(existing)
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onReady = (event: Event): void => {
      if (timer !== undefined) clearTimeout(timer)
      window.removeEventListener(GLASS_EVENT, onReady)
      resolve((event as CustomEvent<BackgroundGlassApi>).detail)
    }
    timer = setTimeout(() => {
      window.removeEventListener(GLASS_EVENT, onReady)
      resolve(null)
    }, timeoutMs)
    window.addEventListener(GLASS_EVENT, onReady)
  })
}

/**
 * Subscribe to every glass-bridge publication, including hot reloads.
 *
 * Unlike {@link whenGlassReady} (which settles once), this keeps the ready
 * listener attached for the whole fiber: if the background plugin hot-reloads
 * and re-publishes the bridge, the caller can re-register its surfaces against
 * the new api. Returns the unsubscriber for effect cleanup.
 *
 * @param listener - invoked immediately if the bridge is already published,
 *   then again after every `dsh-background-glass:ready` event.
 * @returns the unsubscriber (idempotent).
 */
export function subscribeGlassReady(listener: (glass: BackgroundGlassApi) => void): () => void {
  const existing = (window as unknown as Record<string, unknown>)[GLASS_GLOBAL] as BackgroundGlassApi | undefined
  if (existing !== undefined) listener(existing)
  const onReady = (event: Event): void => {
    listener((event as CustomEvent<BackgroundGlassApi>).detail)
  }
  window.addEventListener(GLASS_EVENT, onReady)
  return () => {
    window.removeEventListener(GLASS_EVENT, onReady)
  }
}
