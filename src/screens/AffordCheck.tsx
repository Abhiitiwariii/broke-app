import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, PiggyBank, ShieldAlert } from 'lucide-react'
import { BrutalButton } from '../components/BrutalButton'
import { NumberField } from '../components/NumberField'
import { ResultCard } from '../components/ResultCard'
import {
  emi,
  affordVerdictWithExpenses,
  disposableIncome,
  maxAffordablePrice,
  emergencyRunwayMonths,
  bufferVerdict,
  monthsToAfford,
  cibilRateBand,
} from '../lib/finance'
import { getProfile, setProfile, addHistory, getSettings } from '../lib/storage'
import { inr, inrCompact, humanMonths } from '../lib/format'
import { affordRoast, bufferRoast, reverseAffordRoast } from '../lib/tone'
import { haptic } from '../lib/ui'
import { track } from '../lib/analytics'
import { partnersByKind } from '../data/partners'
import { WANTS, getWant } from '../data/wants'
import { useRouter } from '../lib/router'

const SAFE_RATIO = 0.3
type Num = number | ''
const val = (n: Num) => (n === '' ? 0 : n)

export function AffordCheck() {
  const { navigate } = useRouter()
  const saved = getProfile()
  const tone = getSettings().roastTone

  const [wantId, setWantId] = useState<string>('phone')
  const want = getWant(wantId)

  const [price, setPrice] = useState<Num>(want.typicalPrice)
  const [months, setMonths] = useState<Num>(want.defaultMonths)
  const [rate, setRate] = useState<Num>(want.defaultRatePct)
  const [income, setIncome] = useState<Num>(saved.netMonthlyIncome || '')
  const [existingEmis, setExistingEmis] = useState<Num>(saved.existingEmis || '')
  const [fixedExpenses, setFixedExpenses] = useState<Num>(saved.fixedExpenses || '')
  const [liquidSavings, setLiquidSavings] = useState<Num>(saved.liquidSavings || '')
  const [cibil, setCibil] = useState<Num>(saved.cibil ?? '')
  const [submitted, setSubmitted] = useState(false)

  function pickWant(id: string) {
    const w = getWant(id)
    setWantId(id); setPrice(w.typicalPrice); setMonths(w.defaultMonths); setRate(w.defaultRatePct)
    setSubmitted(false)
  }

  const result = useMemo(() => {
    const newEmi = emi(val(price), val(rate), val(months))
    const disposable = disposableIncome(val(income), val(existingEmis), val(fixedExpenses))
    const verdict = affordVerdictWithExpenses(newEmi, val(income), val(existingEmis), val(fixedExpenses))
    const runway = emergencyRunwayMonths(val(liquidSavings), val(existingEmis) + newEmi, val(fixedExpenses))
    const bufV = bufferVerdict(runway)
    const ceiling = maxAffordablePrice(val(income), val(existingEmis), val(fixedExpenses), val(rate), val(months))
    const earnMore = Math.max(0, Math.round(newEmi / SAFE_RATIO - disposable))
    const saveUpMonths = monthsToAfford(val(price), Math.max(0, disposable))
    const band = cibilRateBand(cibil === '' ? 720 : cibil)
    return { newEmi, disposable, verdict, runway, bufV, ceiling, earnMore, saveUpMonths, band }
  }, [price, rate, months, income, existingEmis, fixedExpenses, liquidSavings, cibil])

  const canSubmit = val(income) > 0 && val(price) > 0

  function handleCheck() {
    haptic(18)
    setSubmitted(true)
    track('afford_verdict', { verdict: result.verdict, want: wantId })
    setProfile({
      netMonthlyIncome: val(income),
      existingEmis: val(existingEmis),
      fixedExpenses: val(fixedExpenses),
      liquidSavings: val(liquidSavings),
      cibil: cibil === '' ? null : cibil,
    })
    addHistory({ id: `${Date.now()}`, at: Date.now(), label: want.label, verdict: result.verdict, price: val(price) })
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-7">
      <div>
        <span className="tag tag--go">Afford check</span>
        <h1 className="mt-3 text-4xl font-black leading-none">Can I afford it?</h1>
        <p className="mt-2 font-display font-bold text-paper/55">
          Real math: income minus EMIs <span className="highlight">and</span> your fixed bills.
        </p>
      </div>

      {/* Step 1 — want grid */}
      <section>
        <StepLabel n={1} text="What do you want?" />
        <div className="mt-3 grid grid-cols-3 gap-3">
          {WANTS.map((w) => {
            const active = w.id === wantId
            return (
              <motion.button
                key={w.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => pickWant(w.id)}
                className={[
                  'flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 font-display text-xs font-extrabold uppercase transition-colors',
                  active ? 'border-pop bg-pop/20 text-paper' : 'border-line bg-card text-paper/70',
                ].join(' ')}
              >
                <span className="text-2xl" aria-hidden>{w.emoji}</span>
                {w.label}
              </motion.button>
            )
          })}
        </div>
        <p className="mt-2 text-xs font-semibold text-paper/45">{want.blurb}</p>
      </section>

      {/* Step 2 — numbers */}
      <section className="flex flex-col gap-4">
        <StepLabel n={2} text="Your money" />
        <NumberField label={`${want.label} price`} value={price} onChange={setPrice} hint="Prefilled with a typical price — edit to your exact quote." />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Tenure" value={months} onChange={setMonths} prefix="" suffix="mo" />
          <NumberField label="Interest" value={rate} onChange={setRate} prefix="" suffix="% p.a." />
        </div>
        <NumberField label="Net monthly income" value={income} onChange={setIncome} hint="Take-home, after tax." />
        <NumberField label="Existing EMIs / month" value={existingEmis} onChange={setExistingEmis} hint="Optional — other loans you already pay." />
        <NumberField label="Fixed monthly expenses" value={fixedExpenses} onChange={setFixedExpenses} hint="Rent, food, bills, subscriptions — money already spoken for." />
        <NumberField label="Liquid savings" value={liquidSavings} onChange={setLiquidSavings} hint="Cash you could reach in an emergency. Powers your safety runway." />
        <NumberField label="CIBIL score" value={cibil} onChange={setCibil} prefix="" min={300} max={900} hint="Optional — sharpens the rate estimate (defaults to 720)." />

        {val(income) > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-line bg-elev px-4 py-3">
            <span className="font-display text-xs font-black uppercase tracking-wide text-paper/55">Free to commit / month</span>
            <span className={['font-display text-xl font-black tabular-nums', result.disposable <= 0 ? 'text-danger' : 'text-paper'].join(' ')}>
              {inr(result.disposable)}
            </span>
          </div>
        )}

        <BrutalButton variant="ink" size="lg" full disabled={!canSubmit} onClick={handleCheck}>
          {canSubmit ? 'Hit me with the verdict' : 'Enter income + price'}
        </BrutalButton>
      </section>

      {submitted && canSubmit && (
        <section className="flex flex-col gap-4">
          <ResultCard
            verdict={result.verdict}
            headline={`${want.emoji} ${want.label} · ${inrCompact(val(price))}`}
            price={val(price)}
            emi={result.newEmi}
            months={val(months)}
            roast={affordRoast(result.verdict, want.label, tone)}
            affordInMonths={result.saveUpMonths}
            cibilBand={result.band}
          />

          {result.verdict === 'danger' && (
            <div className="card p-5">
              <div className="flex items-center gap-2 font-display text-xs font-black uppercase tracking-wider text-go">
                <TrendingUp className="h-4 w-4" /> Reality check
              </div>
              <p className="mt-1 font-display text-lg font-black leading-tight text-paper">
                {reverseAffordRoast(result.ceiling.maxPrice, tone)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Max price now" value={inrCompact(result.ceiling.maxPrice)} />
                <MiniStat label="Safe EMI" value={`${inr(result.ceiling.maxEmi)}/mo`} />
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-sm font-semibold text-paper/75">
                {result.earnMore > 0 && (
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0 text-go" />
                    <span>…or earn about <b className="text-go">{inr(result.earnMore)}/mo</b> more to reach this {want.label.toLowerCase()}.</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 shrink-0 text-warn" />
                  <span>…or save up and buy outright in <b className="text-warn">{humanMonths(result.saveUpMonths)}</b>.</span>
                </li>
              </ul>
            </div>
          )}

          {val(liquidSavings) > 0 && (
            <BufferCard months={result.runway} verdict={result.bufV} roast={bufferRoast(result.bufV, result.runway, tone)} />
          )}

          {result.verdict === 'danger' && (
            <div className="card p-5">
              <div className="font-display text-xs font-black uppercase tracking-wider text-pop">Partner offer • estimate</div>
              {partnersByKind('nocost-emi').map((p) => (
                <div key={p.id} className="mt-2">
                  <div className="font-display text-lg font-black text-paper">{p.label}</div>
                  <p className="mt-1 text-sm font-semibold text-paper/60">{p.note}</p>
                </div>
              ))}
              <div className="mt-4">
                <BrutalButton variant="warn" full onClick={() => navigate('debt')}>Check your debt health →</BrutalButton>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

const BUF: Record<'go' | 'warn' | 'danger', { text: string; glow: string }> = {
  go: { text: 'text-go', glow: 'glow-go' },
  warn: { text: 'text-warn', glow: 'glow-warn' },
  danger: { text: 'text-danger', glow: 'glow-danger' },
}

function BufferCard({ months, verdict, roast }: { months: number; verdict: 'go' | 'warn' | 'danger'; roast: string }) {
  const m = BUF[verdict]
  const cap = Math.min(6, Number.isFinite(months) ? months : 6)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className={['card p-5', m.glow].join(' ')}
    >
      <div className="flex items-center gap-2">
        <ShieldAlert className={['h-5 w-5', m.text].join(' ')} />
        <h2 className="text-xl font-black leading-none text-paper">Emergency runway</h2>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className={['font-display text-4xl font-black tabular-nums leading-none', m.text].join(' ')}>
          {Number.isFinite(months) ? months : '∞'}
        </span>
        <span className="mb-0.5 font-display text-sm font-black uppercase text-paper/70">months if income stops</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full bg-current" style={{ color: `var(--color-${verdict === 'go' ? 'go' : verdict === 'warn' ? 'warn' : 'danger'})` }}
          initial={{ width: 0 }} animate={{ width: `${(cap / 6) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
      </div>
      <p className="mt-3 text-sm font-bold text-paper/80">{roast}</p>
    </motion.div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-3">
      <div className="font-display text-[10px] font-bold uppercase tracking-wide text-paper/45">{label}</div>
      <div className="font-display text-xl font-black tabular-nums text-go">{value}</div>
    </div>
  )
}

function StepLabel({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pop font-display text-xs font-black text-white">{n}</span>
      <span className="font-display text-sm font-black uppercase tracking-tight text-paper">{text}</span>
    </div>
  )
}
