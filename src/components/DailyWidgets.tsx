import { motion } from 'framer-motion'
import { inr } from '../lib/format'
import { useCountUp } from '../lib/ui'

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
        className={['text-3xl leading-none', active ? '' : 'grayscale opacity-40'].join(' ')}
        aria-hidden
      >
        🔥
      </motion.span>
      <div className="leading-none">
        <div className="num text-2xl font-bold tabular-nums">{count}</div>
        <div className="font-display text-[9px] font-black uppercase tracking-wider opacity-60">
          day streak
        </div>
      </div>
    </div>
  )
}

const BAR_COLOR = (frac: number) =>
  frac >= 1 ? 'var(--color-danger)' : frac >= 0.75 ? 'var(--color-warn)' : 'var(--color-go)'

/**
 * Allowance burn-down bar — the lead-story headline number over a chunky ink
 * meter that fills as the day's spend approaches the daily allowance and turns
 * amber then red. Tabloid replacement for the old ring.
 */
export function AllowanceBar({
  spent,
  allowance,
}: {
  spent: number
  allowance: number
}) {
  const frac = allowance > 0 ? Math.min(1, spent / allowance) : spent > 0 ? 1 : 0
  const over = allowance > 0 && spent > allowance
  const remaining = allowance - spent
  const color = BAR_COLOR(allowance > 0 ? spent / allowance : 0)
  const shown = useCountUp(Math.abs(remaining), 800)

  if (allowance <= 0) {
    return (
      <div className="text-center">
        <div className="font-display text-lg font-black uppercase leading-tight">Set your income</div>
        <p className="mt-1 num text-xs text-paper/60">unlock your daily spend headline</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[11px] font-black uppercase tracking-[0.16em] text-paper/60">
          {over ? 'Over budget by' : 'Left to spend today'}
        </span>
        <span className="num text-[11px] font-bold text-paper/55">of {inr(allowance)}/day</span>
      </div>

      <div
        className="num mt-1 font-bold leading-none tabular-nums"
        style={{ fontSize: '52px', color: over ? 'var(--color-danger)' : 'var(--color-paper)' }}
      >
        {inr(Math.round(shown))}
      </div>

      {/* ink burn-down meter */}
      <div className="mt-3 h-5 w-full border-[1.5px] border-paper bg-elev p-[3px]">
        <motion.div
          className="h-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(frac * 100)}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  )
}
