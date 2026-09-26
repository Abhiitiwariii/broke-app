/**
 * Mixpanel analytics — null-guarded + opt-out.
 *
 * Initialises only when VITE_MIXPANEL_TOKEN is set. Anonymous before login,
 * `identify(user.id)` after. No financial values (salary, balances, prices) are
 * ever sent — only verdict *categories*, event names and counts. Users can opt
 * out (Me screen); the choice persists in localStorage and survives reloads.
 */
import mixpanel from 'mixpanel-browser'

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN as string | undefined
const EU = import.meta.env.VITE_MIXPANEL_EU === 'true'
const OPT_OUT_KEY = 'broke.analyticsOptOut'

let ready = false

/** True when a Mixpanel token is configured. */
export const analyticsConfigured = TOKEN != null

export function isOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function initAnalytics(): void {
  if (!TOKEN || ready) return
  try {
    mixpanel.init(TOKEN, {
      api_host: EU ? 'https://api-eu.mixpanel.com' : 'https://api.mixpanel.com',
      persistence: 'localStorage',
      ignore_dnt: false,
    })
    ready = true
    if (isOptedOut()) mixpanel.opt_out_tracking()
  } catch {
    /* analytics must never break the app */
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!ready || isOptedOut()) return
  try {
    mixpanel.track(event, props)
  } catch {
    /* ignore */
  }
}

/** Tie subsequent events to the signed-in Supabase user. */
export function identifyUser(id: string): void {
  if (!ready) return
  try {
    mixpanel.identify(id)
  } catch {
    /* ignore */
  }
}

/** Clear identity on sign-out. */
export function resetAnalytics(): void {
  if (!ready) return
  try {
    mixpanel.reset()
  } catch {
    /* ignore */
  }
}

/** Persist + apply the opt-out choice from the Me screen. */
export function setAnalyticsOptOut(optOut: boolean): void {
  try {
    localStorage.setItem(OPT_OUT_KEY, optOut ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (!ready) return
  try {
    if (optOut) mixpanel.opt_out_tracking()
    else mixpanel.opt_in_tracking()
  } catch {
    /* ignore */
  }
}
