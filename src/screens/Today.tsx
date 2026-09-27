import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, TrendingDown, ArrowRight } from 'lucide-react'
import { BrutalButton } from '../components/BrutalButton'
import { AllowanceRing, StreakFlame } from '../components/DailyWidgets'
import { asset } from '../lib/assets'
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
import { Milestones } from '../components/Milestones'
import { track } from '../lib/analytics'

function dateline(): string {
  return new Date()
    .toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
    .toUpperCase()
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
    track('daily_check_in', { kind })
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

  const tickerItems = [
    `🔥 ${streak.current}-DAY STREAK`,
    allowance > 0 ? `${inr(allowance)}/DAY BUDGET` : 'SET YOUR INCOME',
    over ? `OVER BY ${inr(spentToday - allowance)}` : checkedInToday ? 'CHECKED IN TODAY ✓' : 'CHECK IN BEFORE MIDNIGHT',
    'BROKE? — FIND OUT BEFORE YOU ARE',
  ]

  const heroVideo = asset('today-hero-video')
  const heroImg = asset('today-hero')
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="relative">
      {celebrate && <Confetti />}

      {/* ===== Cinematic hero ===== */}
      <section className="hero-mesh relative overflow-hidden">
        {/* backdrop: video → image → aurora (from .hero-mesh) */}
        {heroVideo && !prefersReduced ? (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            src={heroVideo}
            poster={heroImg ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
        ) : heroImg ? (
          <img className="absolute inset-0 h-full w-full object-cover opacity-45" src={heroImg} alt="" aria-hidden />
        ) : null}
        <div className="scrim-b absolute inset-0 z-[1]" aria-hidden />

        {/* Masthead */}
        <div className="relative z-10 px-5 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="grad-anim font-display text-[52px] font-black uppercase leading-[0.8]">
                Broke<span className="text-glow-pop">?</span>
              </div>
              <div className="mt-1.5 num text-[10px] font-bold uppercase tracking-[0.16em] text-paper/60">
                {dateline()} · your money today
              </div>
            </div>
            <StreakFlame count={streak.current} active={checkedInToday} />
          </div>
          <div className="rule mt-3" />
        </div>

        {/* Headline ticker */}
        <div className="relative z-10">
          <Ticker items={tickerItems} />
        </div>

        {/* Lead story — the allowance ring */}
        <div className="relative z-10 px-5 pb-6 pt-5">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="glass float-2 p-5"
          >
            <span className="tag tag--grad mb-4">Today's headline</span>
            <AllowanceRing spent={spentToday} allowance={allowance} />
            <p className="mt-4 border-t border-line pt-3 text-center font-display text-sm font-black uppercase leading-snug text-paper/80">
              {roast}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="flex flex-col gap-4 px-5 pb-6 pt-4">
        {/* Check-in CTA — STOP PRESS */}
        {checkedInToday ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-between border-[1.5px] border-go bg-go/10 px-5 py-3.5"
          >
            <span className="font-display font-black uppercase tracking-tight text-go">✓ Checked in today</span>
            <button type="button" onClick={() => setSheetOpen(true)} className="font-display text-xs font-black uppercase text-paper/60 underline">
              Add another
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-2">
            {atRisk && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 border-[1.5px] border-danger bg-danger/10 px-3 py-2 font-display text-xs font-black uppercase tracking-wide text-danger"
              >
                <span className="chip-live" aria-hidden />
                Streak at risk — check in before midnight
              </motion.div>
            )}
            <div className="pulse-cta">
              <BrutalButton variant="danger" size="lg" full onClick={() => setSheetOpen(true)}>
                🔥 Stop press · Daily check-in
              </BrutalButton>
            </div>
          </div>
        )}

        {/* Streak scoreboard */}
        <Milestones current={streak.current} longest={streak.longest} />

        {/* Quick tools */}
        <div>
          <div className="mb-2.5 font-display text-xs font-black uppercase tracking-[0.14em] text-paper/55">The desk · quick tools</div>
          <div className="grid grid-cols-2 gap-3">
            <Tile Icon={ShoppingBag} label="Worth it?" sub="Afford check" onClick={() => navigate('afford')} />
            <Tile Icon={TrendingDown} label="Debt trap" sub="Health score" onClick={() => navigate('debt')} />
          </div>
          {isProUnlocked && (
            <button
              type="button"
              onClick={() => navigate('escape')}
              className="brand-fill glow-brand mt-3 flex w-full items-center justify-between rounded-[14px] px-5 py-4 text-white"
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

function Ticker({ items }: { items: string[] }) {
  const row = items.join('    ✦    ')
  return (
    <div className="ticker mt-3">
      <div className="ticker-track num text-[11px] font-bold uppercase tracking-wide">
        <span>{row}</span>
        <span aria-hidden>{row}</span>
      </div>
    </div>
  )
}

function Tile({
  Icon,
  label,
  sub,
  onClick,
}: {
  Icon: typeof ShoppingBag
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="card card-lift p-4 text-left">
      <span className="brand-fill glow-brand flex h-9 w-9 items-center justify-center rounded-[10px] text-white">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-2.5 font-display text-lg font-black uppercase leading-none text-paper">{label}</div>
      <div className="mt-1 font-display text-[11px] font-bold uppercase tracking-wide text-paper/55">{sub}</div>
    </button>
  )
}
