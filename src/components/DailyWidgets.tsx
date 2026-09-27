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

/**
 * Neon allowance RING — the Today lead-story hero visual. A 3/4-ish full ring
 * with a red→violet gradient stroke that sweeps in on load, the money figure
 * counting up in the center. Turns amber then red as spend nears the allowance.
 */
export function AllowanceRing({
  spent,
  allowance,
  size = 208,
}: {
  spent: number
  allowance: number
  size?: number
}) {
  const frac = allowance > 0 ? Math.min(1, spent / allowance) : spent > 0 ? 1 : 0
  const over = allowance > 0 && spent > allowance
  const remaining = allowance - spent
  const stroke = 16
  const r = (size - stroke) / 2 - 4
  const c = size / 2
  const circ = 2 * Math.PI * r
  const dash = frac * circ
  const shown = useCountUp(Math.abs(remaining), 900)
  const solid = over ? 'var(--color-danger)' : frac >= 0.75 ? 'var(--color-warn)' : null

  if (allowance <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center" style={{ minHeight: size }}>
        <div className="font-display text-2xl font-black uppercase leading-tight">Set your income</div>
        <p className="mt-1 num text-xs text-paper/60">unlock your daily spend headline</p>
      </div>
    )
  }

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`${over ? 'Over budget' : 'Left to spend today'}: ${inr(Math.abs(remaining))} of ${inr(allowance)} per day`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="allowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff3b6b" />
            <stop offset="100%" stopColor="#8b5cff" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-paper)" strokeOpacity={0.1} strokeWidth={stroke} />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={solid ?? 'url(#allowGrad)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 12px ${over ? '#ff3355' : '#b64bff'})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-display text-[10px] font-black uppercase tracking-[0.16em] text-paper/60">
          {over ? 'Over budget by' : 'Left today'}
        </span>
        <span className="num font-bold leading-none tabular-nums" style={{ fontSize: 42, color: over ? 'var(--color-danger)' : 'var(--color-paper)' }}>
          {inr(Math.round(shown))}
        </span>
        <span className="num mt-1 text-[11px] font-bold text-paper/50">of {inr(allowance)}/day</span>
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
      <div className="mt-3 h-5 w-full overflow-hidden rounded-full border border-line bg-elev p-[3px]">
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
