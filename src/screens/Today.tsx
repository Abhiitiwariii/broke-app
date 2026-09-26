import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, TrendingDown, ArrowRight } from 'lucide-react'
import { BrutalButton } from '../components/BrutalButton'
import { AllowanceRing, StreakFlame } from '../components/DailyWidgets'
import { CheckInSheet } from '../components/CheckInSheet'
import { Confetti } from '../components/Confetti'
import {
  todayKey,
  dailyAllowance,
  spentOn,
  applyCheckIn,
  streakState,
  type CheckInKind,
} from '../lib/daily'
import {
  getProfile,
  getDebts,
  getSettings,
  getStreak,
  setStreak,
  getCheckins,
  addCheckin,
} from '../lib/storage'
import { inr } from '../lib/format'
import { useRouter } from '../lib/router'
import { usePro } from '../lib/proContext'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

export function Today() {
  const { navigate } = useRouter()
  const { isProUnlocked } = usePro()
  const today = todayKey()

  const [streak, setStreakState] = useState(getStreak)
  const [checkins, setCheckins] = useState(getCheckins)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const profile = getProfile()
  const debts = getDebts()
  const settings = getSettings()

  const emis = debts.length ? debts.reduce((s, d) => s + (d.minPayment || 0), 0) : profile.existingEmis
  const allowance = useMemo(
    () => dailyAllowance(profile.netMonthlyIncome, emis, settings.savingsGoalPct),
    [profile.netMonthlyIncome, emis, settings.savingsGoalPct],
  )
  const spentToday = spentOn(checkins, today)
  const { checkedInToday, atRisk } = streakState(streak, today)
  const hasIncome = profile.netMonthlyIncome > 0
  const over = allowance > 0 && spentToday > allowance

  function handleSubmit(spent: number, kind: CheckInKind) {
    addCheckin({ date: today, spent, kind })
    const nextStreak = applyCheckIn(streak, today)
    setStreak(nextStreak)
    setStreakState(nextStreak)
    setCheckins(getCheckins())
    setSheetOpen(false)
    if (!checkedInToday) {
      setCelebrate(true)
      window.setTimeout(() => setCelebrate(false), 1400)
    }
  }

  const roast = !hasIncome
    ? 'Add your income so I can call out your spending.'
    : over
      ? `You're ${inr(spentToday - allowance)} over today. Tomorrow's a fresh start.`
      : checkedInToday
        ? "Under budget and checked in. That's how you un-broke."
        : atRisk
          ? "Your streak's on the line — check in before midnight."
          : "Log today's money in one tap. Keep the streak alive."

  return (
    <div className="relative">
      {celebrate && <Confetti />}

      {/* Neon aurora hero — wordmark + ring are the stars */}
      <div className="hero-mesh grain relative px-5 pb-8 pt-5">
        <div className="relative flex items-start justify-between">
          <div>
            <div className="grad-text grad-anim font-display text-[42px] font-black leading-none">
              Broke<span className="text-danger">?</span>
            </div>
            <div className="mt-1.5 font-display text-[11px] font-black uppercase tracking-[0.18em] text-muted">
              {greeting()} · your money today
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white/5 px-3 py-2 backdrop-blur-md">
            <StreakFlame count={streak.current} active={checkedInToday} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative mt-5 flex justify-center"
        >
          <AllowanceRing spent={spentToday} allowance={allowance} />
        </motion.div>

        <p className="relative mt-5 text-center font-display text-sm font-bold text-paper/85">{roast}</p>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
        {/* Check-in CTA */}
        {checkedInToday ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-between rounded-full border border-go/40 bg-go/10 px-5 py-3.5"
          >
            <span className="font-display font-black uppercase tracking-tight text-go">✓ Checked in today</span>
            <button type="button" onClick={() => setSheetOpen(true)} className="font-display text-xs font-black uppercase text-muted underline">
              Add another
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            {atRisk && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-2 font-display text-xs font-black uppercase tracking-wide text-danger"
              >
                <span className="chip-live" aria-hidden />
                Streak at risk — check in before midnight
              </motion.div>
            )}
            <div className="pulse-cta">
              <BrutalButton variant="ink" size="lg" full onClick={() => setSheetOpen(true)}>
                🔥 Daily check-in
              </BrutalButton>
            </div>
          </div>
        )}

        {/* Quick tools */}
        <div>
          <div className="mb-2.5 font-display text-xs font-black uppercase tracking-[0.14em] text-muted">Quick tools</div>
          <div className="grid grid-cols-2 gap-3">
            <Tile Icon={ShoppingBag} label="Worth it?" sub="Afford check" accent="go" onClick={() => navigate('afford')} />
            <Tile Icon={TrendingDown} label="Debt trap" sub="Health score" accent="warn" onClick={() => navigate('debt')} />
          </div>
          {isProUnlocked && (
            <button
              type="button"
              onClick={() => navigate('escape')}
              className="glow-brand mt-3 flex w-full items-center justify-between rounded-2xl brand-fill px-5 py-4 text-white"
            >
              <span className="font-display font-black uppercase tracking-tight">★ Escape plan</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <CheckInSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={handleSubmit} />
    </div>
  )
}

function Tile({
  Icon,
  label,
  sub,
  accent,
  onClick,
}: {
  Icon: typeof ShoppingBag
  label: string
  sub: string
  accent: 'go' | 'warn'
  onClick: () => void
}) {
  const ring = accent === 'go' ? 'text-go' : 'text-warn'
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.97 }} className="card card-lift p-4 text-left">
      <span className={['flex h-9 w-9 items-center justify-center rounded-xl bg-white/6', ring].join(' ')}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-2.5 font-display text-lg font-black leading-none text-paper">{label}</div>
      <div className="mt-1 font-display text-[11px] font-bold uppercase tracking-wide text-muted">{sub}</div>
    </motion.button>
  )
}
