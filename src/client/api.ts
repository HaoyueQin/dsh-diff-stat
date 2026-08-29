/**
 * Browser access to the host half's fenced file API. The host half is
 * optional (a profile can compose this plugin's client without its server
 * route), so every call degrades to null and the card hides the dependent
 * actions. Availability is probed once per page and cached module-wide.
 */
const BASE = '/dsh-diff-stat/api'

/** Abort a hung host request after this long (never leave a pane loading forever). */
const REQUEST_TIMEOUT_MS = 10_000

/** fetch with a hard abort; rejects on timeout or network failure. */
async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(input, {
      ...init,
      // The module-owned hard timeout always wins over a caller-supplied signal.
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * POST one action to the fenced API.
 * @returns the parsed payload, or null when the host half is absent/unreachable.
 */
export async function hostCall<T>(action: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetchWithTimeout(BASE + '/' + encodeURIComponent(action), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

let probe: Promise<boolean> | null = null

/**
 * Whether the host half is serving (probed once, cached).
 * A failed probe is retried on the NEXT CALL only: the host route appears
 * late (hot reload), so keeping the failed promise would hide the actions for
 * the whole page lifetime.
 */
export function hostAvailable(): Promise<boolean> {
  probe ??= (async () => {
    try {
      const res = await fetchWithTimeout(BASE + '/ping')
      return res.ok
    } catch {
      // Allow a later call to probe again (the promise this call returned
      // stays false — the actions just re-check on the next user interaction).
      probe = null
      return false
    }
  })()
  return probe
}