import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BrutalButton } from '../components/BrutalButton'
import { AllowanceRing, StreakFlame } from '../components/DailyWidgets'
import { CheckInSheet } from '../components/CheckInSheet'
import { Confetti } from '../components/Confetti'
import { asset } from '../lib/assets'
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

  const emis = debts.length
    ? debts.reduce((s, d) => s + (d.minPayment || 0), 0)
    : profile.existingEmis

  const allowance = useMemo(
    () => dailyAllowance(profile.netMonthlyIncome, emis, settings.savingsGoalPct),
    [profile.netMonthlyIncome, emis, settings.savingsGoalPct],
  )
  const spentToday = spentOn(checkins, today)
  const { checkedInToday, atRisk } = streakState(streak, today)
  const hasIncome = profile.netMonthlyIncome > 0
  const over = allowance > 0 && spentToday > allowance
  const heroArt = asset('today-hero')

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
      ? `You're ${inr(spentToday - allowance)} over today. Tomorrow's a fresh 🔥.`
      : checkedInToday
        ? "Under budget and checked in. That's how you un-broke."
        : atRisk
          ? "Your streak's on the line — check in before midnight."
          : "Log today's money in one tap. Keep the streak alive."

  return (
    <div className="relative">
      {celebrate && <Confetti />}

      {/* Full-bleed cinematic hero */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
        {heroArt ? (
          <img src={heroArt} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="halftone absolute inset-0" />
        )}
        <div className="scrim-b absolute inset-0" />

        {/* top row over the art */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <div>
            <div className="font-display text-4xl font-black leading-none drop-shadow-[0_2px_12px_#000]">
              Broke<span className="text-danger">?</span>
            </div>
            <div className="mt-1 font-display text-[11px] font-black uppercase tracking-widest text-paper/70">
              {greeting()} · your money today
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-bg/40 px-3 py-2 backdrop-blur-md">
            <StreakFlame count={streak.current} active={checkedInToday} />
          </div>
        </div>

        {/* roast pinned to the fade */}
        <p className="absolute inset-x-0 bottom-0 px-5 pb-4 text-center font-display text-sm font-bold text-paper/90">
          {roast}
        </p>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 -mt-2">
        {/* Allowance ring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className={[
            'card flex flex-col items-center p-5',
            checkedInToday && !over ? 'glow-go' : over ? 'glow-danger' : '',
          ].join(' ')}
        >
          <AllowanceRing spent={spentToday} allowance={allowance} />
        </motion.div>

        {/* Check-in CTA */}
        {checkedInToday ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-between rounded-2xl border border-go/40 bg-go/10 p-4"
          >
            <span className="font-display font-black uppercase tracking-tight text-go">
              ✓ Checked in today
            </span>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="font-display text-xs font-black uppercase text-paper/70 underline"
            >
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
              <BrutalButton variant="pop" size="lg" full onClick={() => setSheetOpen(true)}>
                🔥 Daily check-in
              </BrutalButton>
            </div>
          </div>
        )}

        {/* Quick tools */}
        <div>
          <div className="mb-2 font-display text-xs font-black uppercase tracking-wider text-paper/45">
            Quick tools
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Tile emoji="🛒" label="Worth it?" sub="Afford check" accent="go" onClick={() => navigate('afford')} />
            <Tile emoji="📉" label="Debt trap" sub="Health score" accent="warn" onClick={() => navigate('debt')} />
          </div>
          {isProUnlocked && (
            <button
              type="button"
              onClick={() => navigate('escape')}
              className="mt-3 flex w-full items-center justify-between rounded-2xl border border-pop/40 bg-pop/15 p-4 text-paper"
            >
              <span className="font-display font-black uppercase">★ Escape plan</span>
              <span className="text-xl">→</span>
            </button>
          )}
        </div>
      </div>

      <CheckInSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={handleSubmit} />
    </div>
  )
}

function Tile({
  emoji,
  label,
  sub,
  accent,
  onClick,
}: {
  emoji: string
  label: string
  sub: string
  accent: 'go' | 'warn'
  onClick: () => void
}) {
  const ring = accent === 'go' ? 'border-go/40 hover:border-go' : 'border-warn/40 hover:border-warn'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={['rounded-2xl border bg-card p-4 text-left transition-colors', ring].join(' ')}
    >
      <div className="text-2xl" aria-hidden>{emoji}</div>
      <div className="mt-1 font-display text-lg font-black leading-none text-paper">{label}</div>
      <div className="font-display text-[11px] font-bold uppercase tracking-wide text-paper/45">{sub}</div>
    </motion.button>
  )
}
