/**
 * Broke? — daily-habit logic (streak + allowance). Pure functions, unit-tested.
 * All dates are handled as local 'YYYY-MM-DD' day keys so a check-in belongs to
 * the user's calendar day, not UTC.
 */

export type CheckInKind = 'spent' | 'saved' | 'resisted'

export interface CheckIn {
  date: string // 'YYYY-MM-DD'
  spent: number
  kind: CheckInKind
  note?: string
}

export interface Streak {
  current: number
  longest: number
  lastCheckIn: string | null
  freezes: number
}

export const EMPTY_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastCheckIn: null,
  freezes: 0,
}

/** Local calendar day key, e.g. '2026-09-22'. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Days in the calendar month of `d`. */
export function daysInMonth(d: Date = new Date()): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/** Whole-day difference a - b for two 'YYYY-MM-DD' keys (a later => positive). */
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const ta = Date.UTC(ay, am - 1, ad)
  const tb = Date.UTC(by, bm - 1, bd)
  return Math.round((ta - tb) / 86_400_000)
}

/**
 * Daily spendable allowance:
 *   (netIncome − fixed EMIs − savings goal) ÷ days in the month.
 * Savings goal is a % of net income. Never negative.
 */
export function dailyAllowance(
  netIncome: number,
  emis: number,
  savingsGoalPct: number,
  d: Date = new Date(),
): number {
  if (netIncome <= 0) return 0
  const savings = (netIncome * Math.max(0, savingsGoalPct)) / 100
  const spendable = netIncome - Math.max(0, emis) - savings
  if (spendable <= 0) return 0
  return spendable / daysInMonth(d)
}

/** Total spent logged on a given day. */
export function spentOn(checkins: CheckIn[], dateKey: string): number {
  return checkins
    .filter((c) => c.date === dateKey)
    .reduce((s, c) => s + (c.spent || 0), 0)
}

/**
 * Advance the streak for a check-in on `dateKey`.
 *   - already checked in today  -> unchanged
 *   - checked in yesterday      -> current + 1
 *   - a one-day gap with a freeze available -> current + 1, consume a freeze
 *   - any bigger gap / first ever -> reset to 1
 * `longest` always tracks the max seen.
 */
export function applyCheckIn(streak: Streak, dateKey: string): Streak {
  const last = streak.lastCheckIn
  if (last === dateKey) return streak

  let current: number
  let freezes = streak.freezes

  if (last == null) {
    current = 1
  } else {
    const gap = dayDiff(dateKey, last)
    if (gap === 1) {
      current = streak.current + 1
    } else if (gap === 2 && freezes > 0) {
      current = streak.current + 1
      freezes -= 1
    } else {
      current = 1 // missed too long (or a backwards/duplicate date) -> restart
    }
  }

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastCheckIn: dateKey,
    freezes,
  }
}

/** Whether the user has checked in today and whether the streak is about to lapse. */
export function streakState(
  streak: Streak,
  today: string = todayKey(),
): { checkedInToday: boolean; atRisk: boolean } {
  if (streak.lastCheckIn == null) return { checkedInToday: false, atRisk: false }
  const gap = dayDiff(today, streak.lastCheckIn)
  return {
    checkedInToday: gap === 0,
    atRisk: gap >= 1 && streak.current > 0,
  }
}
