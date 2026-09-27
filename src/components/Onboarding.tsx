import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalButton } from './BrutalButton'
import { NumberField } from './NumberField'
import { getProfile, setProfile, getSettings, setSettings } from '../lib/storage'
import { dailyAllowance } from '../lib/daily'
import { inr } from '../lib/format'
import { haptic } from '../lib/ui'

type Num = number | ''
type SavingsMode = 'percent' | 'amount'
const val = (n: Num) => (n === '' ? 0 : n)
const clampPct = (n: number) => Math.max(0, Math.min(90, Math.round(n)))

/** First-run: salary → fixed costs + savings target (% or ₹) → daily number. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [income, setIncome] = useState<Num>('')
  const [fixed, setFixed] = useState<Num>('')
  const [goal, setGoal] = useState(getSettings().savingsGoalPct)
  const [mode, setMode] = useState<SavingsMode>('percent')
  const [amount, setAmount] = useState<Num>('')

  // math always runs on a %; a ₹ amount is converted here, never in daily.ts
  const effectivePct =
    mode === 'amount' && val(income) > 0 ? clampPct((val(amount) / val(income)) * 100) : goal
  const allowance = dailyAllowance(val(income), 0, effectivePct)

  function finish() {
    haptic(18)
    setProfile({ ...getProfile(), netMonthlyIncome: val(income), fixedExpenses: val(fixed) })
    setSettings({
      savingsGoalPct: effectivePct,
      savingsMode: mode,
      savingsAmount: mode === 'amount' ? val(amount) : 0,
    })
    onDone()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-bg"
      style={{ backgroundImage: 'radial-gradient(#ffffff0d 0.5px, transparent 0.6px)', backgroundSize: '3px 3px' }}
    >
      {/* Masthead */}
      <div className="px-6 pt-8">
        <div className="grad-text font-display text-[52px] font-black uppercase leading-[0.82]">
          Broke<span className="text-danger">?</span>
        </div>
        <div className="mt-1.5 num text-[10px] font-bold uppercase tracking-[0.16em] text-paper/60">
          Find out before you are
        </div>
        <div className="rule-thick mt-3" />
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="mb-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={['h-1.5 flex-1 rounded-full', i <= step ? 'brand-fill' : 'bg-paper/15'].join(' ')} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Panel key="s0">
              <h2 className="text-3xl font-black uppercase leading-tight">First — what lands in your account each month?</h2>
              <p className="mt-2 font-display font-bold text-paper/55">Take-home pay, after tax.</p>
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
              <h2 className="text-3xl font-black uppercase leading-tight">What's already spoken for?</h2>
              <p className="mt-2 font-display font-bold text-paper/55">Rent, food, bills, subscriptions — gone before you decide anything.</p>
              <div className="mt-5 flex flex-col gap-5">
                <NumberField label="Fixed monthly expenses" value={fixed} onChange={setFixed} hint="Rough is fine — change it later." />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-display text-xs font-black uppercase tracking-wide text-paper/60">Savings goal</span>
                    <div className="flex overflow-hidden rounded-full border border-line">
                      <ModeBtn active={mode === 'percent'} onClick={() => setMode('percent')} label="%" />
                      <ModeBtn active={mode === 'amount'} onClick={() => setMode('amount')} label="₹" />
                    </div>
                  </div>

                  {mode === 'percent' ? (
                    <>
                      <div className="mb-1 text-right font-display text-lg font-black text-danger">{goal}%</div>
                      <input type="range" min={0} max={50} step={5} value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-full" />
                    </>
                  ) : (
                    <>
                      <NumberField label="" value={amount} onChange={setAmount} hint="Amount to set aside each month." />
                      {val(income) > 0 && val(amount) > 0 && (
                        <p className="mt-1 num text-xs font-bold text-paper/55">≈ {effectivePct}% of your income</p>
                      )}
                    </>
                  )}
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
                  className="num my-2 text-6xl font-bold text-go"
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

function ModeBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={['px-3 py-1 font-display text-sm font-black uppercase', active ? 'brand-fill text-white' : 'bg-elev text-paper/55'].join(' ')}
    >
      {label}
    </button>
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
