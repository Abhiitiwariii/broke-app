import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalButton } from './BrutalButton'
import { NumberField } from './NumberField'
import { asset } from '../lib/assets'
import { getProfile, setProfile, getSettings, setSettings } from '../lib/storage'
import { dailyAllowance } from '../lib/daily'
import { inr } from '../lib/format'
import { haptic } from '../lib/ui'

type Num = number | ''
const val = (n: Num) => (n === '' ? 0 : n)

/** Lightweight first-run: get income → costs → land on the daily number. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [income, setIncome] = useState<Num>('')
  const [fixed, setFixed] = useState<Num>('')
  const [goal, setGoal] = useState(getSettings().savingsGoalPct)

  const allowance = dailyAllowance(val(income), 0, goal)
  const hero = asset('today-hero')

  function finish() {
    haptic(18)
    setProfile({ ...getProfile(), netMonthlyIncome: val(income), fixedExpenses: val(fixed) })
    setSettings({ savingsGoalPct: goal })
    onDone()
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-bg">
      {/* hero */}
      <div className="relative h-[38vh] min-h-[220px] w-full overflow-hidden">
        {hero ? (
          <img src={hero} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="halftone absolute inset-0" />
        )}
        <div className="scrim-b absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="font-display text-5xl font-black leading-none">
            Broke<span className="text-danger">?</span>
          </div>
          <p className="mt-1 font-display font-bold text-paper/70">find out before you are.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="mb-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={['h-1.5 flex-1 rounded-full', i <= step ? 'bg-pop' : 'bg-white/10'].join(' ')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Panel key="s0">
              <h2 className="text-3xl font-black leading-tight">First — what lands in your account each month?</h2>
              <p className="mt-2 font-display font-bold text-paper/55">Take-home pay, after tax. We never send this anywhere — it stays on your phone.</p>
              <div className="mt-5">
                <NumberField label="Net monthly income" value={income} onChange={setIncome} />
              </div>
              <div className="mt-auto pt-6">
                <BrutalButton variant="ink" size="lg" full disabled={val(income) <= 0} onClick={() => setStep(1)}>
                  Next →
                </BrutalButton>
              </div>
            </Panel>
          )}

          {step === 1 && (
            <Panel key="s1">
              <h2 className="text-3xl font-black leading-tight">What's already spoken for?</h2>
              <p className="mt-2 font-display font-bold text-paper/55">Rent, food, bills, subscriptions — the money gone before you decide anything.</p>
              <div className="mt-5 flex flex-col gap-4">
                <NumberField label="Fixed monthly expenses" value={fixed} onChange={setFixed} hint="Rough is fine — you can change it later." />
                <div>
                  <div className="mb-1 flex items-center justify-between font-display text-xs font-extrabold uppercase text-paper/60">
                    Savings goal <span className="text-pop">{goal}%</span>
                  </div>
                  <input type="range" min={0} max={50} step={5} value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <div className="mt-auto pt-6">
                <BrutalButton variant="ink" size="lg" full onClick={() => setStep(2)}>See my daily number →</BrutalButton>
              </div>
            </Panel>
          )}

          {step === 2 && (
            <Panel key="s2">
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="font-display text-xs font-black uppercase tracking-widest text-paper/50">You can spend, guilt-free</div>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="my-2 font-display text-6xl font-black text-go"
                >
                  {inr(allowance)}
                </motion.div>
                <div className="font-display text-sm font-black uppercase tracking-wide text-paper/60">a day</div>
                <p className="mt-4 max-w-[280px] font-display font-bold text-paper/60">
                  Check in each day, keep your streak, and Broke? tells you the truth before you buy.
                </p>
              </div>
              <div className="pb-8">
                <BrutalButton variant="go" size="lg" full onClick={finish}>Let's go 🔥</BrutalButton>
              </div>
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
