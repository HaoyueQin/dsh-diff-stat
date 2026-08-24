/**
 * Browser access to the host half's fenced file API. The host half is
 * optional (a profile can compose this plugin's client without its server
 * route), so every call degrades to null and the card hides the dependent
 * actions. Availability is probed once per page and cached module-wide.
 */
const BASE = '/dsh-diff-stat/api'

/**
 * POST one action to the fenced API.
 * @returns the parsed payload, or null when the host half is absent/unreachable.
 */
export async function hostCall<T>(action: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(BASE + '/' + action, {
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
 * A failed probe is not retried within the page lifetime — a route that
 * appears later is picked up on the next full page load.
 */
export function hostAvailable(): Promise<boolean> {
  probe ??= (async () => {
    try {
      const res = await fetch(BASE + '/ping')
      return res.ok
    } catch {
      return false
    }
  })()
  return probe
}