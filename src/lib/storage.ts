/**
 * localStorage persistence (plan.md §5). All access is wrapped in try/catch so
 * the app keeps working in private mode / storage-disabled contexts, and always
 * falls back to a sensible default on read.
 */
import type { Debt } from './finance'
import { EMPTY_STREAK, type CheckIn, type Streak } from './daily'
import type { RoastTone } from './tone'

export interface Profile {
  netMonthlyIncome: number
  existingEmis: number
  cibil: number | null
  /** Fixed monthly costs beyond EMIs (rent, food, bills, subscriptions). */
  fixedExpenses: number
  /** Liquid savings available for an emergency (drives runway). */
  liquidSavings: number
}

export interface HistoryEntry {
  id: string
  at: number
  label: string
  verdict: 'go' | 'warn' | 'danger'
  price: number
}

export interface Settings {
  savingsGoalPct: number
  /** Roast personality for verdict copy. Defaults to 'honest'. */
  roastTone: RoastTone
  /** Whether the user set their savings goal as a % or a ₹ amount. */
  savingsMode: 'percent' | 'amount'
  /** The raw ₹ amount when savingsMode === 'amount' (for display; math uses the derived pct). */
  savingsAmount: number
}

const KEYS = {
  profile: 'broke.profile',
  debts: 'broke.debts',
  isPro: 'broke.isPro',
  history: 'broke.history',
  settings: 'broke.settings',
  streak: 'broke.streak',
  checkins: 'broke.checkins',
} as const

export const DEFAULT_PROFILE: Profile = {
  netMonthlyIncome: 0,
  existingEmis: 0,
  cibil: null,
  fixedExpenses: 0,
  liquidSavings: 0,
}

export const DEFAULT_SETTINGS: Settings = {
  savingsGoalPct: 20,
  roastTone: 'honest',
  savingsMode: 'percent',
  savingsAmount: 0,
}

// ---- Change notifier (drives cloud-sync pushes) -----------------------
type Listener = () => void
const listeners = new Set<Listener>()
let muted = false

/** Subscribe to any local write. Returns an unsubscribe fn. */
export function subscribeStorage(cb: Listener): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function notify(): void {
  if (muted) return
  listeners.forEach((l) => {
    try { l() } catch { /* ignore */ }
  })
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    notify()
  } catch {
    /* storage unavailable — silently degrade (in-memory only) */
  }
}

export function getProfile(): Profile {
  return { ...DEFAULT_PROFILE, ...read<Partial<Profile>>(KEYS.profile, {}) }
}
export function setProfile(p: Profile): void {
  write(KEYS.profile, p)
}

export function getDebts(): Debt[] {
  const d = read<Debt[]>(KEYS.debts, [])
  return Array.isArray(d) ? d : []
}
export function setDebts(d: Debt[]): void {
  write(KEYS.debts, d)
}

export function getIsPro(): boolean {
  return read<boolean>(KEYS.isPro, false) === true
}
export function setIsPro(v: boolean): void {
  write(KEYS.isPro, v)
}

export function getHistory(): HistoryEntry[] {
  const h = read<HistoryEntry[]>(KEYS.history, [])
  return Array.isArray(h) ? h : []
}
export function addHistory(entry: HistoryEntry): void {
  const h = getHistory()
  write(KEYS.history, [entry, ...h].slice(0, 20))
}

// ---- Daily-habit state -------------------------------------------------
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) }
}
/** Merge a partial update into the stored settings. */
export function setSettings(patch: Partial<Settings>): void {
  write(KEYS.settings, { ...getSettings(), ...patch })
}

export function getStreak(): Streak {
  return { ...EMPTY_STREAK, ...read<Partial<Streak>>(KEYS.streak, {}) }
}
export function setStreak(s: Streak): void {
  write(KEYS.streak, s)
}

export function getCheckins(): CheckIn[] {
  const c = read<CheckIn[]>(KEYS.checkins, [])
  return Array.isArray(c) ? c : []
}
export function addCheckin(entry: CheckIn): void {
  const c = getCheckins().filter((x) => x.date !== entry.date || x.kind !== entry.kind)
  // keep newest ~60 days
  write(KEYS.checkins, [entry, ...c].slice(0, 120))
}

// ---- Privacy / data controls ------------------------------------------
const ALL_KEYS = Object.values(KEYS)

/** Everything Broke? has stored on this device, as one plain object. */
export function exportAllData(): Record<string, unknown> {
  const out: Record<string, unknown> = { app: 'Broke?', exportedAt: new Date().toISOString() }
  for (const k of ALL_KEYS) {
    out[k] = read<unknown>(k, null)
  }
  return out
}

/** Wipe every Broke? key from this device. Returns true if it completed cleanly. */
export function deleteAllData(): boolean {
  try {
    ALL_KEYS.forEach((k) => localStorage.removeItem(k))
    return true
  } catch {
    return false
  }
}

// ---- Cloud-sync snapshot ----------------------------------------------
export interface SyncSnapshot {
  profile: Profile
  settings: Settings
  streak: Streak
  checkins: CheckIn[]
  history: HistoryEntry[]
}

/** The syncable slice of local state (no `isPro` — that's device-local). */
export function getSyncSnapshot(): SyncSnapshot {
  return {
    profile: getProfile(),
    settings: getSettings(),
    streak: getStreak(),
    checkins: getCheckins(),
    history: getHistory(),
  }
}

/** Apply a remote snapshot to local storage WITHOUT re-triggering a push. */
export function applySyncSnapshot(s: Partial<SyncSnapshot> | null | undefined): void {
  if (!s || typeof s !== 'object') return
  muted = true
  try {
    if (s.profile) write(KEYS.profile, { ...DEFAULT_PROFILE, ...s.profile })
    if (s.settings) write(KEYS.settings, { ...DEFAULT_SETTINGS, ...s.settings })
    if (s.streak) write(KEYS.streak, s.streak)
    if (Array.isArray(s.checkins)) write(KEYS.checkins, s.checkins)
    if (Array.isArray(s.history)) write(KEYS.history, s.history)
  } finally {
    muted = false
  }
}
