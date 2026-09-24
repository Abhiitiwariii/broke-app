import { describe, it, expect } from 'vitest'
import {
  todayKey,
  daysInMonth,
  dayDiff,
  dailyAllowance,
  spentOn,
  applyCheckIn,
  streakState,
  EMPTY_STREAK,
  type CheckIn,
  type Streak,
} from './daily'

describe('date helpers', () => {
  it('formats a local day key', () => {
    expect(todayKey(new Date(2026, 8, 22))).toBe('2026-09-22')
  })
  it('counts days in a month', () => {
    expect(daysInMonth(new Date(2026, 1, 1))).toBe(28) // Feb 2026
    expect(daysInMonth(new Date(2026, 8, 1))).toBe(30) // Sep
  })
  it('diffs two day keys', () => {
    expect(dayDiff('2026-09-22', '2026-09-21')).toBe(1)
    expect(dayDiff('2026-09-22', '2026-09-22')).toBe(0)
    expect(dayDiff('2026-10-01', '2026-09-30')).toBe(1)
  })
})

describe('dailyAllowance', () => {
  it('splits spendable income across the month', () => {
    // ₹60k income, ₹10k EMIs, 20% savings(=12k) -> 38k / 30 days ≈ 1266.67
    expect(dailyAllowance(60000, 10000, 20, new Date(2026, 8, 1))).toBeCloseTo(1266.67, 1)
  })
  it('never goes negative', () => {
    expect(dailyAllowance(20000, 25000, 20)).toBe(0)
    expect(dailyAllowance(0, 0, 20)).toBe(0)
  })
})

describe('spentOn', () => {
  it('sums a single day', () => {
    const c: CheckIn[] = [
      { date: '2026-09-22', spent: 300, kind: 'spent' },
      { date: '2026-09-22', spent: 200, kind: 'spent' },
      { date: '2026-09-21', spent: 999, kind: 'spent' },
    ]
    expect(spentOn(c, '2026-09-22')).toBe(500)
  })
})

describe('applyCheckIn', () => {
  it('starts a streak at 1', () => {
    const s = applyCheckIn(EMPTY_STREAK, '2026-09-22')
    expect(s.current).toBe(1)
    expect(s.longest).toBe(1)
    expect(s.lastCheckIn).toBe('2026-09-22')
  })
  it('is a no-op when already checked in today', () => {
    const s1 = applyCheckIn(EMPTY_STREAK, '2026-09-22')
    const s2 = applyCheckIn(s1, '2026-09-22')
    expect(s2).toBe(s1)
  })
  it('increments on consecutive days', () => {
    let s = applyCheckIn(EMPTY_STREAK, '2026-09-20')
    s = applyCheckIn(s, '2026-09-21')
    s = applyCheckIn(s, '2026-09-22')
    expect(s.current).toBe(3)
    expect(s.longest).toBe(3)
  })
  it('resets after a missed day', () => {
    let s = applyCheckIn(EMPTY_STREAK, '2026-09-20')
    s = applyCheckIn(s, '2026-09-22') // skipped the 21st, no freeze
    expect(s.current).toBe(1)
    expect(s.longest).toBe(1)
  })
  it('spends a freeze to survive a one-day gap', () => {
    const base: Streak = { current: 5, longest: 5, lastCheckIn: '2026-09-20', freezes: 1 }
    const s = applyCheckIn(base, '2026-09-22')
    expect(s.current).toBe(6)
    expect(s.freezes).toBe(0)
  })
})

describe('streakState', () => {
  it('knows when checked in today', () => {
    const s = applyCheckIn(EMPTY_STREAK, '2026-09-22')
    expect(streakState(s, '2026-09-22')).toEqual({ checkedInToday: true, atRisk: false })
  })
  it('flags an at-risk streak', () => {
    const s: Streak = { current: 4, longest: 4, lastCheckIn: '2026-09-21', freezes: 0 }
    expect(streakState(s, '2026-09-22')).toEqual({ checkedInToday: false, atRisk: true })
  })
})
