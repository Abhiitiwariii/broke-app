import { motion } from 'framer-motion'
import { verdictFromScore } from '../lib/finance'

interface Props {
  score: number // 0..100
  size?: number
}

const COLOR = {
  go: 'var(--color-go)',
  warn: 'var(--color-warn)',
  danger: 'var(--color-danger)',
}

/** Animated brutalist arc dial for a 0..100 score. */
export function ScoreDial({ score, size = 220 }: Props) {
  const clamped = Math.max(0, Math.min(100, score))
  const verdict = verdictFromScore(clamped)
  const stroke = 18
  const r = (size - stroke) / 2 - 6
  const cx = size / 2
  const cy = size / 2
  // 3/4 sweep gauge from 135deg to 405deg (270deg total)
  const circumference = 2 * Math.PI * r
  const arcFraction = 0.75
  const arcLen = circumference * arcFraction
  const dash = (clamped / 100) * arcLen

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Debt health score ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="rotate-[135deg]">
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-paper)"
          strokeOpacity={0.12}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={`${arcLen} ${circumference}`}
        />
        {/* value */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLOR[verdict]}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${circumference}`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
        {/* outline ring for the brutalist edge */}
        <circle
          cx={cx}
          cy={cy}
          r={r + stroke / 2}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={3}
          strokeDasharray={`${arcLen * (circumference / circumference)} ${circumference}`}
          strokeDashoffset={0}
          opacity={0}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={clamped}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="font-display text-6xl font-black tabular-nums"
        >
          {clamped}
        </motion.span>
        <span className="font-display text-xs font-bold uppercase tracking-[0.2em] opacity-60">
          / 100
        </span>
      </div>
    </div>
  )
}
