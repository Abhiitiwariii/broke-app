import { motion } from 'framer-motion'
import { inr } from '../lib/format'

/** Flame + streak count. Dimmed when today isn't checked in yet. */
export function StreakFlame({
  count,
  active,
}: {
  count: number
  active: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <motion.span
        key={count}
        initial={{ scale: 0.6, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        className={['text-4xl leading-none', active ? '' : 'grayscale opacity-50'].join(' ')}
        aria-hidden
      >
        🔥
      </motion.span>
      <div className="leading-none">
        <div className="num text-3xl font-bold tabular-nums">{count}</div>
        <div className="font-display text-[10px] font-black uppercase tracking-wider opacity-60">
          day streak
        </div>
      </div>
    </div>
  )
}

const RING_COLORS = (frac: number) =>
  frac >= 1 ? 'var(--color-danger)' : frac >= 0.75 ? 'var(--color-warn)' : 'var(--color-go)'

/**
 * Allowance burn-down ring. Fills as the day's spend approaches the daily
 * allowance; turns amber then red. Center shows what's left (or over).
 */
export function AllowanceRing({
  spent,
  allowance,
  size = 176,
}: {
  spent: number
  allowance: number
  size?: number
}) {
  const stroke = 16
  const r = (size - stroke) / 2 - 4
  const c = 2 * Math.PI * r
  const frac = allowance > 0 ? Math.min(1, spent / allowance) : spent > 0 ? 1 : 0
  const over = allowance > 0 && spent > allowance
  const remaining = allowance - spent
  const color = RING_COLORS(allowance > 0 ? spent / allowance : 0)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-paper)"
          strokeOpacity={0.12}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - frac) }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {allowance <= 0 ? (
          <span className="px-4 text-center font-display text-xs font-bold opacity-60">
            Set your income to unlock a daily budget
          </span>
        ) : (
          <>
            <span className="font-display text-[10px] font-black uppercase tracking-wider opacity-55">
              {over ? 'over by' : 'left today'}
            </span>
            <span
              className="num text-4xl font-bold tabular-nums"
              style={{ color: over ? 'var(--color-danger)' : 'var(--color-paper)' }}
            >
              {inr(Math.abs(remaining))}
            </span>
            <span className="num text-[11px] font-medium opacity-55">
              of {inr(allowance)}/day
            </span>
          </>
        )}
      </div>
    </div>
  )
}
