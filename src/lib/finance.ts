/**
 * Broke? — finance engine.
 *
 * Every rupee-affecting formula lives here as a pure function. Screens only call
 * these and render. Formulas follow plan.md section 4.
 *
 * Conventions:
 *   r = monthly rate = annualRatePct / 1200
 *   All money is in rupees; rates are annual percentages (e.g. 18 = 18%).
 */

export type Verdict = 'go' | 'warn' | 'danger'
export type Strategy = 'avalanche' | 'snowball'

export interface Debt {
  name: string
  balance: number
  annualRatePct: number
  minPayment: number
}

export interface PayoffTimelinePoint {
  month: number
  remaining: number
}

export interface PayoffResult {
  order: string[]
  monthsToDebtFree: number
  totalInterest: number
  timeline: PayoffTimelinePoint[]
}

export interface PrepaymentResult {
  interestSaved: number
  monthsSaved: number
}

export interface CibilBand {
  band: string
  minRate: number
  maxRate: number
}

/** Clamp a number into [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Round to 2 decimals for money. */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Equated Monthly Instalment.
 * emi = P*r*(1+r)^n / ((1+r)^n - 1), guarding r === 0 -> P/n.
 */
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0
  if (principal <= 0) return 0
  const r = annualRatePct / 1200
  if (r === 0) return round2(principal / months)
  const pow = Math.pow(1 + r, months)
  return round2((principal * r * pow) / (pow - 1))
}

/**
 * Fixed Obligation to Income Ratio.
 * Returns a ratio 0..>1. Guards zero/negative income.
 */
export function foir(totalMonthlyEmis: number, netMonthlyIncome: number): number {
  if (totalMonthlyEmis <= 0) return 0
  if (netMonthlyIncome <= 0) return Infinity
  return totalMonthlyEmis / netMonthlyIncome
}

/**
 * Verdict from a FOIR ratio (RBI-aligned bands).
 *   < 0.40         -> go     (safe)
 *   0.40 .. 0.50   -> warn   (caution)
 *   > 0.50         -> danger
 */
export function verdictFromFoir(ratio: number): Verdict {
  if (ratio < 0.4) return 'go'
  if (ratio <= 0.5) return 'warn'
  return 'danger'
}

/**
 * Verdict for a single discretionary purchase ("can I afford this want?").
 * Uses the new-EMI-to-income ratio (plus any existing EMIs) against tighter
 * thresholds than the RBI total-debt bands, because one gadget eating a big
 * slice of monthly income is a "think twice" even when overall FOIR looks fine.
 *   < 0.10        -> go
 *   0.10 .. 0.20  -> warn
 *   > 0.20        -> danger
 */
export function affordVerdict(totalMonthlyEmis: number, netMonthlyIncome: number): Verdict {
  const ratio = foir(totalMonthlyEmis, netMonthlyIncome)
  if (ratio < 0.1) return 'go'
  if (ratio <= 0.2) return 'warn'
  return 'danger'
}

/**
 * Debt Health Score 0..100 from FOIR.
 * score = clamp(round(100 - foir*140), 0, 100).
 * Display bands: >=60 go | 40-59 warn | <40 danger.
 */
export function debtHealthScore(foirRatio: number): number {
  if (!Number.isFinite(foirRatio)) return 0
  return clamp(Math.round(100 - foirRatio * 140), 0, 100)
}

/** Verdict for a 0..100 debt-health score (display bands). */
export function verdictFromScore(score: number): Verdict {
  if (score >= 60) return 'go'
  if (score >= 40) return 'warn'
  return 'danger'
}

/**
 * Months of saving needed to buy something outright.
 * ceil(targetPrice / monthlySavingCapacity). Guards capacity <= 0 -> Infinity.
 */
export function monthsToAfford(targetPrice: number, monthlySavingCapacity: number): number {
  if (targetPrice <= 0) return 0
  if (monthlySavingCapacity <= 0) return Infinity
  return Math.ceil(targetPrice / monthlySavingCapacity)
}

/**
 * Simulate amortization of a balance at monthly payment `payment`.
 * Returns months taken and total interest paid. If the payment can never
 * cover the accruing interest, returns Infinity months.
 */
function amortize(
  balance: number,
  monthlyRate: number,
  payment: number,
): { months: number; interest: number } {
  if (balance <= 0) return { months: 0, interest: 0 }
  if (payment <= 0) return { months: Infinity, interest: Infinity }
  if (monthlyRate === 0) {
    const months = Math.ceil(balance / payment)
    return { months, interest: 0 }
  }
  // Payment must exceed the first month's interest to ever clear the loan.
  if (payment <= balance * monthlyRate) return { months: Infinity, interest: Infinity }

  let bal = balance
  let interest = 0
  let months = 0
  const CAP = 100000
  while (bal > 0.005 && months < CAP) {
    const monthInterest = bal * monthlyRate
    interest += monthInterest
    const principalPaid = Math.min(payment - monthInterest, bal)
    bal -= principalPaid
    months += 1
  }
  return { months, interest: round2(interest) }
}

/**
 * Prepayment savings: apply a lump sum to the outstanding principal while
 * keeping the same EMI, then compare total interest and tenure.
 * Both outputs are >= 0.
 */
export function prepaymentSavings(
  principal: number,
  annualRatePct: number,
  months: number,
  lumpSum: number,
): PrepaymentResult {
  if (principal <= 0 || months <= 0) return { interestSaved: 0, monthsSaved: 0 }
  const r = annualRatePct / 1200
  const scheduledEmi = emi(principal, annualRatePct, months)

  const original = amortize(principal, r, scheduledEmi)
  const newBalance = Math.max(0, principal - lumpSum)
  const after = amortize(newBalance, r, scheduledEmi)

  const interestSaved = Math.max(0, round2(original.interest - after.interest))
  const monthsSaved = Math.max(0, original.months - after.months)
  return { interestSaved, monthsSaved }
}

/**
 * Debt payoff simulator (debt avalanche / snowball).
 * avalanche -> target highest annualRatePct first; snowball -> lowest balance first.
 * Each month: accrue interest, pay every debt's minPayment (capped), then roll
 * all leftover cash (extra + freed-up minimums) onto the current target debt.
 */
export function payoffPlan(
  debts: Debt[],
  strategy: Strategy,
  extraPerMonth: number,
): PayoffResult {
  const active = debts
    .filter((d) => d.balance > 0)
    .map((d) => ({ ...d }))

  const sorted = [...active].sort((a, b) =>
    strategy === 'avalanche'
      ? b.annualRatePct - a.annualRatePct
      : a.balance - b.balance,
  )
  const order = sorted.map((d) => d.name)

  if (sorted.length === 0) {
    return { order, monthsToDebtFree: 0, totalInterest: 0, timeline: [] }
  }

  let totalInterest = 0
  let months = 0
  const timeline: PayoffTimelinePoint[] = [
    { month: 0, remaining: round2(sorted.reduce((s, d) => s + d.balance, 0)) },
  ]
  const CAP = 1200 // 100 years — safety valve

  while (sorted.some((d) => d.balance > 0.005) && months < CAP) {
    months += 1
    // 1. Accrue interest on every debt.
    for (const d of sorted) {
      if (d.balance <= 0) continue
      const monthInterest = d.balance * (d.annualRatePct / 1200)
      d.balance += monthInterest
      totalInterest += monthInterest
    }
    // 2. Budget = sum of min payments (on live debts) + extra.
    let budget =
      extraPerMonth +
      sorted.reduce((s, d) => (d.balance > 0 ? s + d.minPayment : s), 0)

    // 3. Pay minimums first (so no debt goes delinquent).
    for (const d of sorted) {
      if (d.balance <= 0) continue
      const pay = Math.min(d.minPayment, d.balance, budget)
      d.balance -= pay
      budget -= pay
      if (budget <= 0) break
    }
    // 4. Roll everything left onto the first (target) live debt, in order.
    for (const d of sorted) {
      if (budget <= 0) break
      if (d.balance <= 0) continue
      const pay = Math.min(d.balance, budget)
      d.balance -= pay
      budget -= pay
    }

    timeline.push({
      month: months,
      remaining: round2(sorted.reduce((s, d) => s + Math.max(0, d.balance), 0)),
    })
  }

  return {
    order,
    monthsToDebtFree: months,
    totalInterest: round2(totalInterest),
    timeline,
  }
}

/**
 * Illustrative personal-loan interest bands by CIBIL score. Labelled as
 * estimates in the UI — real rates depend on the lender.
 */
export function cibilRateBand(score: number): CibilBand {
  if (score >= 800) return { band: '800+', minRate: 10.5, maxRate: 12 }
  if (score >= 750) return { band: '750–799', minRate: 12, maxRate: 14 }
  if (score >= 700) return { band: '700–749', minRate: 14, maxRate: 17 }
  if (score >= 650) return { band: '650–699', minRate: 17, maxRate: 22 }
  return { band: 'below 650', minRate: 22, maxRate: 28 }
}

/* ─────────────────────────────────────────────────────────────────────────
 * v3 feedback pass — fixed expenses, reverse affordability, emergency buffer,
 * prepayment v2 (recurring / flat vs reducing / fixed vs floating).
 * ───────────────────────────────────────────────────────────────────────── */

export interface AffordableCeiling {
  /** Largest monthly EMI that still leaves a safe slice of disposable income. */
  maxEmi: number
  /** Loan principal that EMI supports at the given rate/tenure. */
  maxPrincipal: number
  /** maxPrincipal + any down payment the user can put in today. */
  maxPrice: number
}

export interface RecurringPrepaymentResult extends PrepaymentResult {
  /** Tenure (months) once the extra monthly payment is applied. */
  newTenureMonths: number
}

export interface InterestByMethod {
  /** Total interest on a reducing-balance loan (the real cost). */
  reducing: number
  /** Total interest a flat-rate quote implies (looks cheaper, costs more). */
  flat: number
}

export interface FloatingPayoffResult {
  totalInterest: number
  /** EMI in force after the rate change (equals the original EMI if none). */
  finalEmi: number
  /** Months actually taken to clear the loan. */
  monthsPaid: number
}

/**
 * A — money left after existing EMIs and fixed monthly expenses.
 * May be negative (already over-committed); callers decide how to treat that.
 */
export function disposableIncome(
  netIncome: number,
  existingEmis: number,
  fixedExpenses: number,
): number {
  return round2(netIncome - existingEmis - fixedExpenses)
}

/**
 * A — afford verdict that accounts for fixed expenses, not just EMIs.
 * Bands are on the new EMI as a share of *disposable* income:
 *   disposable <= 0     -> danger (nothing free to commit)
 *   ratio < 0.30        -> go
 *   ratio 0.30 .. 0.50  -> warn
 *   ratio > 0.50        -> danger
 */
export function affordVerdictWithExpenses(
  newEmi: number,
  netIncome: number,
  existingEmis: number,
  fixedExpenses: number,
): Verdict {
  const disposable = netIncome - existingEmis - fixedExpenses
  if (disposable <= 0) return 'danger'
  if (newEmi <= 0) return 'go'
  const ratio = newEmi / disposable
  if (ratio < 0.3) return 'go'
  if (ratio <= 0.5) return 'warn'
  return 'danger'
}

/**
 * G — inverse of emi(): the principal a given EMI can service.
 * P = EMI * ((1+r)^n - 1) / (r*(1+r)^n), guarding r === 0 -> EMI*n.
 */
export function principalFromEmi(
  emiAmount: number,
  annualRatePct: number,
  months: number,
): number {
  if (emiAmount <= 0 || months <= 0) return 0
  const r = annualRatePct / 1200
  if (r === 0) return round2(emiAmount * months)
  const pow = Math.pow(1 + r, months)
  return round2((emiAmount * (pow - 1)) / (r * pow))
}

/** G — largest safe EMI: a share (default 30%) of disposable income. */
export function maxAffordableEmi(
  netIncome: number,
  existingEmis: number,
  fixedExpenses: number,
  maxRatio = 0.3,
): number {
  const disposable = netIncome - existingEmis - fixedExpenses
  return Math.max(0, round2(disposable * maxRatio))
}

/**
 * G — "what can I actually afford right now": the max EMI, the loan principal it
 * supports, and the sticker price (principal + down payment).
 */
export function maxAffordablePrice(
  netIncome: number,
  existingEmis: number,
  fixedExpenses: number,
  annualRatePct: number,
  months: number,
  opts: { downPayment?: number; maxRatio?: number } = {},
): AffordableCeiling {
  const maxRatio = opts.maxRatio ?? 0.3
  const downPayment = Math.max(0, opts.downPayment ?? 0)
  const maxEmi = maxAffordableEmi(netIncome, existingEmis, fixedExpenses, maxRatio)
  const maxPrincipal = principalFromEmi(maxEmi, annualRatePct, months)
  return { maxEmi, maxPrincipal, maxPrice: round2(maxPrincipal + downPayment) }
}

/**
 * B — emergency runway: months you could keep servicing EMIs + fixed expenses
 * if income stopped today. No obligations -> Infinity; no savings -> 0.
 */
export function emergencyRunwayMonths(
  liquidSavings: number,
  existingEmis: number,
  fixedExpenses: number,
): number {
  const obligations = existingEmis + fixedExpenses
  if (obligations <= 0) return Infinity
  if (liquidSavings <= 0) return 0
  return Math.round((liquidSavings / obligations) * 10) / 10
}

/** B — resilience verdict from months of runway: >=6 go | 3–5.9 warn | <3 danger. */
export function bufferVerdict(months: number): Verdict {
  if (months >= 6) return 'go'
  if (months >= 3) return 'warn'
  return 'danger'
}

/**
 * H — recurring monthly prepayment: pay `extraPerMonth` on top of the scheduled
 * EMI every month. Returns interest + months saved and the shortened tenure.
 */
export function recurringPrepaymentSavings(
  principal: number,
  annualRatePct: number,
  months: number,
  extraPerMonth: number,
): RecurringPrepaymentResult {
  if (principal <= 0 || months <= 0) {
    return { interestSaved: 0, monthsSaved: 0, newTenureMonths: 0 }
  }
  const r = annualRatePct / 1200
  const scheduledEmi = emi(principal, annualRatePct, months)
  const base = amortize(principal, r, scheduledEmi)
  const boosted = amortize(principal, r, scheduledEmi + Math.max(0, extraPerMonth))
  const interestSaved = Math.max(0, round2(base.interest - boosted.interest))
  const monthsSaved = Math.max(0, base.months - boosted.months)
  return { interestSaved, monthsSaved, newTenureMonths: boosted.months }
}

/**
 * H — flat-rate EMI: (principal + principal*rate*years) / months. Flat quoting
 * charges interest on the full principal for the whole tenure.
 */
export function flatEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const years = months / 12
  const totalInterest = principal * (annualRatePct / 100) * years
  return round2((principal + totalInterest) / months)
}

/**
 * H — total interest the same nominal rate implies under each method. Reducing
 * is the honest cost; flat is always higher for a positive rate.
 */
export function interestByMethod(
  principal: number,
  annualRatePct: number,
  months: number,
): InterestByMethod {
  if (principal <= 0 || months <= 0) return { reducing: 0, flat: 0 }
  const reducingEmi = emi(principal, annualRatePct, months)
  const reducing = Math.max(0, round2(reducingEmi * months - principal))
  const flat = round2(principal * (annualRatePct / 100) * (months / 12))
  return { reducing, flat }
}

/**
 * H — floating rate: EMI starts at `annualRatePct`, then at `changeAtMonth` the
 * rate moves to `newRatePct` and the EMI is recomputed on the remaining balance
 * over the remaining tenure. A change month <=0 or > months means no change (fixed).
 */
export function floatingRatePayoff(
  principal: number,
  annualRatePct: number,
  months: number,
  changeAtMonth: number,
  newRatePct: number,
): FloatingPayoffResult {
  if (principal <= 0 || months <= 0) return { totalInterest: 0, finalEmi: 0, monthsPaid: 0 }
  let bal = principal
  let interest = 0
  let curEmi = emi(principal, annualRatePct, months)
  let rate = annualRatePct / 1200
  let paid = 0
  for (let m = 1; m <= months && bal > 0.005; m++) {
    if (m === changeAtMonth && changeAtMonth > 0) {
      const remaining = months - (m - 1)
      curEmi = emi(round2(bal), newRatePct, remaining)
      rate = newRatePct / 1200
    }
    const monthInterest = bal * rate
    interest += monthInterest
    const principalPaid = Math.min(curEmi - monthInterest, bal)
    bal -= principalPaid
    paid = m
  }
  return { totalInterest: round2(interest), finalEmi: round2(curEmi), monthsPaid: paid }
}
