import { useMemo, useState } from 'react'
import { Plus, X, ArrowRight } from 'lucide-react'
import { BrutalButton } from '../components/BrutalButton'
import { ScoreDial } from '../components/ScoreDial'
import { VerdictBadge } from '../components/VerdictBadge'
import { NumberField } from '../components/NumberField'
import { emi, foir, debtHealthScore, verdictFromScore, type Debt } from '../lib/finance'
import { pct, inr } from '../lib/format'
import { getDebts, setDebts, getProfile, setProfile } from '../lib/storage'
import { useRouter } from '../lib/router'

interface Row extends Debt {
  id: string
  months: number
}

const uid = () => Math.random().toString(36).slice(2, 9)

function tenureFromEmi(d: Debt): number {
  const r = d.annualRatePct / 1200
  if (d.balance <= 0 || d.minPayment <= 0) return 12
  if (r === 0) return Math.max(1, Math.round(d.balance / d.minPayment))
  if (d.minPayment <= d.balance * r) return 24
  const n = -Math.log(1 - (r * d.balance) / d.minPayment) / Math.log(1 + r)
  return Math.max(1, Math.min(360, Math.round(n)))
}

function seedRows(): Row[] {
  const saved = getDebts()
  if (saved.length) return saved.map((d) => ({ ...d, id: uid(), months: tenureFromEmi(d) }))
  return [{ id: uid(), name: 'Credit card', balance: 40000, annualRatePct: 42, minPayment: 0, months: 24 }]
}

function rowEmi(r: Pick<Row, 'balance' | 'annualRatePct' | 'months'>): number {
  return emi(r.balance, r.annualRatePct, r.months)
}

type Num = number | ''
const val = (n: Num) => (n === '' ? 0 : n)

export function DebtHealth() {
  const { navigate } = useRouter()
  const [rows, setRows] = useState<Row[]>(seedRows)
  const [income, setIncome] = useState<Num>(getProfile().netMonthlyIncome || '')

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }
  function addRow() {
    setRows((rs) => [...rs, { id: uid(), name: '', balance: 0, annualRatePct: 24, minPayment: 0, months: 12 }])
  }
  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id))
  }

  const { score, verdict, ratio, totalEmi } = useMemo(() => {
    const totalEmi = rows.reduce((s, r) => s + rowEmi(r), 0)
    const ratio = foir(totalEmi, val(income))
    const score = debtHealthScore(ratio)
    return { score, verdict: verdictFromScore(score), ratio, totalEmi }
  }, [rows, income])

  function persist(nextRows: Row[], nextIncome: Num) {
    setDebts(nextRows.map((r) => ({ name: r.name, balance: r.balance, annualRatePct: r.annualRatePct, minPayment: Math.round(rowEmi(r)) })))
    const p = getProfile()
    setProfile({ ...p, netMonthlyIncome: val(nextIncome) })
  }

  const hasIncome = val(income) > 0

  return (
    <div className="flex flex-col gap-6 px-5 py-7">
      <div>
        <span className="tag tag--warn">Debt trap check</span>
        <h1 className="mt-3 text-4xl font-black leading-none">How deep are you?</h1>
        <p className="mt-2 font-display font-bold text-paper/55">
          Add what you owe. We'll score how close you are to the edge.
        </p>
      </div>

      {/* Score */}
      <div className={['card flex flex-col items-center gap-3 p-6', hasIncome ? `glow-${verdict}` : ''].join(' ')}>
        {hasIncome ? (
          <>
            <ScoreDial score={score} />
            <VerdictBadge verdict={verdict} size="md" />
            <p className="text-center font-display font-bold text-paper/70">
              {Number.isFinite(ratio) ? (
                <><span className="text-paper">{pct(ratio)}</span> of your income goes to debt.</>
              ) : ('Add your monthly income to see the damage.')}
            </p>
          </>
        ) : (
          <p className="py-8 text-center font-display font-bold text-paper/45">
            Enter your income below to get your score.
          </p>
        )}
      </div>

      <NumberField label="Net monthly income" value={income} onChange={(v) => { setIncome(v); persist(rows, v) }} hint="Take-home, after tax." />

      {/* Debts */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-black uppercase tracking-tight text-paper">Your debts</span>
          <span className="font-display text-xs font-bold text-paper/45">{rows.length} · EMI {inr(totalEmi)}/mo</span>
        </div>

        {rows.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center gap-2">
              <input
                value={r.name}
                placeholder="Debt name (e.g. Bike loan)"
                onChange={(e) => updateRow(r.id, { name: e.target.value })}
                onBlur={() => persist(rows, income)}
                className="min-w-0 flex-1 bg-transparent font-display text-lg font-black text-paper outline-none placeholder:text-paper/30"
              />
              <button
                type="button"
                onClick={() => { const next = rows.filter((x) => x.id !== r.id); removeRow(r.id); persist(next, income) }}
                aria-label="Remove debt"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger"
              >
                <X className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MiniField label="Balance" prefix="₹" value={r.balance || ''} onChange={(v) => updateRow(r.id, { balance: val(v) })} onCommit={() => persist(rows, income)} />
              <MiniField label="ROI %" value={r.annualRatePct || ''} onChange={(v) => updateRow(r.id, { annualRatePct: val(v) })} onCommit={() => persist(rows, income)} />
              <MiniField label="Tenure (mo)" value={r.months || ''} onChange={(v) => updateRow(r.id, { months: val(v) })} onCommit={() => persist(rows, income)} />
            </div>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-line bg-elev px-3 py-2">
              <span className="font-display text-[11px] font-black uppercase tracking-wide text-paper/55">Your EMI</span>
              <span className="font-display text-lg font-black tabular-nums text-paper">
                {r.balance > 0 && r.months > 0 ? `${inr(rowEmi(r))}/mo` : '—'}
              </span>
            </div>
          </div>
        ))}

        <BrutalButton variant="paper" full onClick={addRow}>
          <Plus className="h-4 w-4" /> Add a debt
        </BrutalButton>
      </section>

      {/* Escape plan hook (always available now) */}
      <div className="card glow-pop overflow-hidden bg-pop/15 p-6">
        <h2 className="text-2xl font-black leading-none text-paper">Your escape plan is ready</h2>
        <p className="mt-2 font-display font-bold text-paper/75">
          Payoff optimizer, prepayment lab & a step-by-step roadmap out of the red.
        </p>
        <div className="mt-4">
          <BrutalButton variant="pop" full onClick={() => navigate('escape')}>
            Open escape plan <ArrowRight className="h-4 w-4" />
          </BrutalButton>
        </div>
      </div>
    </div>
  )
}

interface MiniProps {
  label: string
  value: number | ''
  prefix?: string
  onChange: (v: number | '') => void
  onCommit: () => void
}

function MiniField({ label, value, prefix, onChange, onCommit }: MiniProps) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-[10px] font-bold uppercase tracking-wide text-paper/45">{label}</span>
      <div className="flex items-center rounded-xl border border-line bg-elev px-2 py-1.5">
        {prefix && <span className="font-display text-sm font-black text-paper/50">{prefix}</span>}
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onBlur={onCommit}
          onChange={(e) => { const raw = e.target.value; if (raw === '') return onChange(''); const n = Number(raw); onChange(Number.isFinite(n) ? n : '') }}
          className="w-full min-w-0 bg-transparent font-display text-base font-bold text-paper outline-none"
        />
      </div>
    </label>
  )
}
