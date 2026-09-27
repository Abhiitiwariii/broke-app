import { motion } from 'framer-motion'
import { Sparkles, Flame, Zap, Star, Crown, type LucideIcon } from 'lucide-react'

interface Tier {
  days: number
  label: string
  Icon: LucideIcon
}

const TIERS: Tier[] = [
  { days: 3, label: 'Spark', Icon: Sparkles },
  { days: 7, label: 'On fire', Icon: Flame },
  { days: 14, label: 'Locked in', Icon: Zap },
  { days: 30, label: 'Unbroke', Icon: Star },
  { days: 100, label: 'Legend', Icon: Crown },
]

/**
 * Streak scoreboard. `best` is the furthest ever reached (longest), so badges
 * stay earned after a slip; `current` drives the tension bar to the next tier.
 */
export function Milestones({ current, longest }: { current: number; longest: number }) {
  const best = Math.max(current, longest)
  const next = TIERS.find((t) => best < t.days)
  const daysToNext = next ? next.days - current : 0

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-black uppercase tracking-tight text-paper">Streak scoreboard</span>
        {next ? (
          <span className="num text-[11px] font-bold uppercase text-paper/60">
            {daysToNext > 0 ? `${daysToNext}d to ${next.label}` : `Reach ${next.label}`}
          </span>
        ) : (
          <span className="tag tag--danger">All unlocked 👑</span>
        )}
      </div>

      {/* tension bar to next tier */}
      {next && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-line bg-elev">
          <motion.div
            className="brand-fill h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.round((current / next.days) * 100))}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          />
        </div>
      )}

      <div className="mt-4 flex justify-between gap-2">
        {TIERS.map((t) => {
          const unlocked = best >= t.days
          const { Icon } = t
          return (
            <div key={t.days} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                whileTap={{ scale: 0.92 }}
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-[12px] border border-line',
                  unlocked ? 'brand-fill glow-brand text-white' : 'bg-elev text-paper/30',
                ].join(' ')}
              >
                <Icon className="h-5 w-5" strokeWidth={2.4} />
              </motion.div>
              <span className={['num text-[11px] font-bold', unlocked ? 'text-paper' : 'text-paper/40'].join(' ')}>
                {t.days}d
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
