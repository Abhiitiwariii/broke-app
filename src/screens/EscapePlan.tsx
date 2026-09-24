import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Compass, Banknote, Calculator, Waves, ListTree } from 'lucide-react'
import { BrutalButton } from '../components/BrutalButton'
import {
  payoffPlan,
  prepaymentSavings,
  recurringPrepaymentSavings,
  interestByMethod,
  floatingRatePayoff,
  emi,
  type Debt,
  type Strategy,
} from '../lib/finance'
import { inr, humanMonths } from '../lib/format'
import { getDebts } from '../lib/storage'
import { BANK_PRESETS, BANK_RATE_DISCLAIMER } from '../data/banks'
import { partnersByKind } from '../data/partners'
import { asset } from '../lib/assets'
import { useRouter } from '../lib/router'

function impliedTenure(d: Debt): number {
  const r = d.annualRatePct / 1200
  if (d.balance <= 0 || d.minPayment <= 0) return 12
  if (r === 0) return Math.ceil(d.balance / d.minPayment)
  if (d.minPayment <= d.balance * r) return 60
  const n = -Math.log(1 - (r * d.balance) / d.minPayment) / Math.log(1 + r)
  return Math.max(1, Math.min(600, Math.ceil(n)))
}

function targetDate(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return 'now'
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

type PrepayMode = 'lump' | 'recurring'

export function EscapePlan() {
  const { navigate } = useRouter()

  const [debts] = useState<Debt[]>(() => getDebts().filter((d) => d.balance > 0))
  const [strategy, setStrategy] = useState<Strategy>('avalanche')
  const [extra, setExtra] = useState(2000)

  const [selIdx, setSelIdx] = useState(0)
  const [rate, setRate] = useState(() => debts[0]?.annualRatePct ?? 18)
  const [mode, setMode] = useState<PrepayMode>('lump')
  const [lump, setLump] = useState(20000)
  const [monthly, setMonthly] = useState(2000)
  const [floatRate, setFloatRate] = useState(() => (debts[0]?.annualRatePct ?? 18) + 2)
  const [floatMonth, setFloatMonth] = useState(12)

  const selected = debts[selIdx]

  useEffect(() => {
    if (!selected) return
    setRate(selected.annualRatePct)
    setFloatRate(selected.annualRatePct + 2)
  }, [selIdx, selected])

  const tenure = selected ? impliedTenure(selected) : 0
  const principal = selected?.balance ?? 0

  const payoff = useMemo(() => payoffPlan(debts, strategy, extra), [debts, strategy, extra])

  const prepay = useMemo(() => {
    if (!selected) return null
    return mode === 'lump'
      ? { ...prepaymentSavings(principal, rate, tenure, lump), newTenureMonths: 0 }
      : recurringPrepaymentSavings(principal, rate, tenure, monthly)
  }, [selected, principal, rate, tenure, mode, lump, monthly])

  const methods = useMemo(() => (selected ? interestByMethod(principal, rate, tenure) : null), [selected, principal, rate, tenure])

  const floating = useMemo(() => {
    if (!selected) return null
    const fixed = floatingRatePayoff(principal, rate, tenure, 0, rate)
    const floated = floatingRatePayoff(principal, rate, tenure, floatMonth, floatRate)
    return { fixed, floated, delta: Math.round(floated.totalInterest - fixed.totalInterest) }
  }, [selected, principal, rate, tenure, floatMonth, floatRate])

  const noDebts = debts.length === 0
  const headerArt = asset('escape-header')

  return (
    <div className="flex flex-col gap-6 pb-2">
      {/* Featured header render */}
      <div className="relative h-52 w-full overflow-hidden">
        {headerArt ? (
          <img src={headerArt} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="halftone absolute inset-0" />
        )}
        <div className="scrim-b absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="tag tag--pop">Un-broke mode</span>
          <h1 className="mt-2 text-4xl font-black leading-none drop-shadow-[0_2px_12px_#000]">Escape plan</h1>
          <p className="mt-1 font-display font-bold text-paper/85">Pay less interest. Get free faster.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5">
        {noDebts ? (
          <div className="card p-6 text-center">
            <p className="font-display font-bold text-paper/70">No debts saved yet. Add them on the Debt check to build your plan.</p>
            <div className="mt-4">
              <BrutalButton variant="ink" full onClick={() => navigate('debt')}>Go to Debt check →</BrutalButton>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Payoff optimizer */}
            <div className="card p-6">
              <SectionTitle Icon={Compass} title="Debt payoff optimizer" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(['avalanche', 'snowball'] as Strategy[]).map((s) => (
                  <Toggle key={s} active={strategy === s} onClick={() => setStrategy(s)}>{s}</Toggle>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-paper/50">
                {strategy === 'avalanche' ? 'Avalanche: kill the highest interest rate first (cheapest overall).' : 'Snowball: kill the smallest balance first (fastest wins).'}
              </p>
              <Slider label="Extra / month" value={extra} display={inr(extra)} min={0} max={20000} step={500} onChange={setExtra} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Debt-free in" value={humanMonths(payoff.monthsToDebtFree)} />
                <Metric label="Total interest" value={inr(payoff.totalInterest)} />
              </div>
              <div className="mt-3">
                <div className="font-display text-[11px] font-bold uppercase tracking-wide text-paper/45">Pay in this order</div>
                <ol className="mt-1 flex flex-wrap gap-2">
                  {payoff.order.map((name, i) => (
                    <li key={name} className="rounded-full border border-line bg-elev px-3 py-1 font-display text-sm font-black text-paper">
                      {i + 1}. {name || 'Unnamed'}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* 2. Prepayment lab */}
            <div className="card p-6">
              <SectionTitle Icon={Banknote} title="Prepayment lab" />
              <label className="mt-3 block">
                <span className="mb-1 block font-display text-xs font-extrabold uppercase text-paper/60">Which debt?</span>
                <select value={selIdx} onChange={(e) => setSelIdx(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-elev px-3 py-2.5 font-display text-base font-bold text-paper">
                  {debts.map((d, i) => (<option key={i} value={i} className="bg-elev">{d.name || `Debt ${i + 1}`} · {inr(d.balance)}</option>))}
                </select>
              </label>

              <div className="mt-4">
                <label className="flex items-center justify-between font-display text-xs font-extrabold uppercase text-paper/60">
                  Interest rate
                  <span className="flex items-center gap-1">
                    <input type="number" value={rate} min={0} max={60} step={0.05} onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 rounded-lg border border-line bg-elev px-2 py-1 text-right font-display text-base font-black text-paper" />
                    <span className="text-sm font-bold text-paper/50">% p.a.</span>
                  </span>
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BANK_PRESETS.map((b) => (
                    <button key={b.id} type="button" onClick={() => setRate(b.personalLoanRate)}
                      className="rounded-full border border-line bg-elev px-3 py-1 font-display text-xs font-black uppercase text-paper/80 transition-colors hover:border-pop hover:text-paper">
                      {b.name} · {b.personalLoanRate}%
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] font-semibold text-paper/40">{BANK_RATE_DISCLAIMER}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Toggle active={mode === 'lump'} onClick={() => setMode('lump')}>One-time lump</Toggle>
                <Toggle active={mode === 'recurring'} onClick={() => setMode('recurring')}>Every month</Toggle>
              </div>

              {mode === 'lump' ? (
                <Slider label="Lump sum" value={lump} display={inr(lump)} min={0} max={Math.max(10000, Math.round(principal))} step={1000} onChange={setLump} />
              ) : (
                <Slider label="Extra / month" value={monthly} display={inr(monthly)} min={0} max={Math.max(1000, Math.round(emi(principal, rate, tenure) * 2))} step={500} onChange={setMonthly} />
              )}

              {prepay && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric label="Interest saved" value={inr(prepay.interestSaved)} accent="go" />
                  <Metric label="Months saved" value={humanMonths(prepay.monthsSaved)} accent="go" />
                </div>
              )}
              {mode === 'recurring' && prepay && prepay.newTenureMonths > 0 && (
                <p className="mt-2 text-xs font-semibold text-paper/60">New payoff: <b className="text-pop">{humanMonths(prepay.newTenureMonths)}</b> instead of {humanMonths(tenure)}.</p>
              )}
              <p className="mt-2 text-xs font-semibold text-paper/45">
                {mode === 'lump' ? 'Assumes you keep the same EMI after prepaying — every rupee then kills principal.' : 'Adds this on top of your EMI every month, straight to principal.'}
              </p>
            </div>

            {/* 3. Reducing vs flat */}
            {methods && (
              <div className="card p-6">
                <SectionTitle Icon={Calculator} title="Reducing vs flat rate" />
                <p className="mt-2 text-xs font-semibold text-paper/50">Same {rate}% quoted two ways over {humanMonths(tenure)}. Flat charges interest on the full amount the whole time — looks cheaper, costs more.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric label="Reducing (real)" value={inr(methods.reducing)} accent="go" />
                  <Metric label="Flat (quoted)" value={inr(methods.flat)} />
                </div>
                {methods.flat > methods.reducing && (
                  <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 font-display text-sm font-black text-danger">
                    A flat quote hides ~{inr(methods.flat - methods.reducing)} extra. Ask for the reducing rate.
                  </div>
                )}
              </div>
            )}

            {/* 4. Floating what-if */}
            {floating && (
              <div className="card p-6">
                <SectionTitle Icon={Waves} title="Floating rate what-if" />
                <p className="mt-2 text-xs font-semibold text-paper/50">What if the rate moves partway through? See the interest hit vs staying fixed.</p>
                <Slider label="New rate at change" value={floatRate} display={`${floatRate}%`} min={1} max={40} step={0.25} onChange={setFloatRate} />
                <Slider label="Changes at month" value={floatMonth} display={`Mo ${floatMonth}`} min={1} max={Math.max(2, tenure)} step={1} onChange={setFloatMonth} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric label="Fixed interest" value={inr(floating.fixed.totalInterest)} />
                  <Metric label="Floating interest" value={inr(floating.floated.totalInterest)} accent={floating.delta > 0 ? 'danger' : 'go'} />
                </div>
                <div className={['mt-3 rounded-xl border px-3 py-2 font-display text-sm font-black', floating.delta > 0 ? 'border-danger/40 bg-danger/10 text-danger' : 'border-go/40 bg-go/10 text-go'].join(' ')}>
                  {floating.delta > 0 ? `Costs ~${inr(floating.delta)} more. New EMI ≈ ${inr(floating.floated.finalEmi)}/mo.` : `Saves ~${inr(Math.abs(floating.delta))}. New EMI ≈ ${inr(floating.floated.finalEmi)}/mo.`}
                </div>
              </div>
            )}

            {/* 5. Roadmap */}
            <div className="card glow-pop bg-pop/15 p-6">
              <SectionTitle Icon={ListTree} title="Debt-trap escape roadmap" />
              <ol className="mt-3 flex flex-col gap-3">
                <Step n={1} title="Stop the bleed">Freeze new EMIs & BNPL. No fresh debt until the plan is done.</Step>
                <Step n={2} title={`Attack via ${strategy}`}>Throw {inr(extra)}/mo extra at the top debt in the order above.</Step>
                <Step n={3} title="Consolidate the worst">
                  Move 40%+ rate balances to one lower-rate loan.
                  <div className="mt-2 rounded-xl border border-line bg-elev p-3">
                    <div className="font-display text-[10px] font-black uppercase tracking-wider text-pop">Partner offer • estimate</div>
                    {partnersByKind('consolidation').map((p) => (
                      <div key={p.id}>
                        <div className="font-display text-sm font-black text-paper">{p.label}</div>
                        <p className="text-xs font-semibold text-paper/60">{p.note}</p>
                      </div>
                    ))}
                  </div>
                </Step>
                <Step n={4} title={`Be free by ${targetDate(payoff.monthsToDebtFree)}`}>Hold the line — that's roughly {humanMonths(payoff.monthsToDebtFree)} away.</Step>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={['rounded-full border px-3 py-2 font-display text-sm font-black uppercase transition-colors', active ? 'border-pop bg-pop text-white' : 'border-line bg-elev text-paper/70'].join(' ')}>
      {children}
    </button>
  )
}

function Slider({ label, value, display, min, max, step, onChange }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 flex items-center justify-between font-display text-xs font-extrabold uppercase text-paper/60">
        {label} <span className="text-pop">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  )
}

function SectionTitle({ Icon, title }: { Icon: typeof Compass; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pop/20 text-pop"><Icon className="h-4 w-4" /></span>
      <h2 className="text-xl font-black leading-none text-paper">{title}</h2>
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: 'go' | 'danger' }) {
  const color = accent === 'go' ? 'text-go' : accent === 'danger' ? 'text-danger' : 'text-paper'
  return (
    <div className="rounded-2xl border border-line bg-elev p-3">
      <div className="font-display text-[10px] font-bold uppercase tracking-wide text-paper/45">{label}</div>
      <div className={['font-display text-xl font-black tabular-nums', color].join(' ')}>{value}</div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-black text-paper">{n}</span>
      <div>
        <div className="font-display font-black text-paper">{title}</div>
        <div className="text-sm font-semibold text-paper/70">{children}</div>
      </div>
    </li>
  )
}
