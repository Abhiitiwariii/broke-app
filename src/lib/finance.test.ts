import { describe, it, expect } from 'vitest'
import {
  emi,
  foir,
  verdictFromFoir,
  affordVerdict,
  debtHealthScore,
  verdictFromScore,
  monthsToAfford,
  prepaymentSavings,
  payoffPlan,
  cibilRateBand,
  clamp,
  disposableIncome,
  affordVerdictWithExpenses,
  principalFromEmi,
  maxAffordableEmi,
  maxAffordablePrice,
  emergencyRunwayMonths,
  bufferVerdict,
  recurringPrepaymentSavings,
  flatEmi,
  interestByMethod,
  floatingRatePayoff,
  type Debt,
} from './finance'

describe('emi', () => {
  it('matches a known amortization value (₹1,00,000 @ 12% for 12 months ≈ ₹8,884.88)', () => {
    expect(emi(100000, 12, 12)).toBeCloseTo(8884.88, 1)
  })

  it('matches ₹80,000 @ 24% for 12 months ≈ ₹7,564.77', () => {
    expect(emi(80000, 24, 12)).toBeCloseTo(7564.77, 1)
  })

  it('guards a zero interest rate -> principal / months', () => {
    expect(emi(12000, 0, 12)).toBe(1000)
  })

  it('guards non-positive months / principal', () => {
    expect(emi(50000, 15, 0)).toBe(0)
    expect(emi(0, 15, 12)).toBe(0)
  })
})

describe('foir + verdict bands (RBI-aligned)', () => {
  it('computes the ratio', () => {
    expect(foir(12000, 30000)).toBeCloseTo(0.4, 5)
  })

  it('guards zero income', () => {
    expect(foir(5000, 0)).toBe(Infinity)
    expect(foir(0, 0)).toBe(0)
  })

  it('honours band boundaries: <0.40 go, 0.40–0.50 warn, >0.50 danger', () => {
    expect(verdictFromFoir(0.39)).toBe('go')
    expect(verdictFromFoir(0.399)).toBe('go')
    expect(verdictFromFoir(0.4)).toBe('warn') // lower boundary is caution
    expect(verdictFromFoir(0.45)).toBe('warn')
    expect(verdictFromFoir(0.5)).toBe('warn') // upper boundary inclusive
    expect(verdictFromFoir(0.5001)).toBe('danger')
    expect(verdictFromFoir(1.2)).toBe('danger')
  })
})

describe('debtHealthScore', () => {
  it('follows 100 - foir*140', () => {
    expect(debtHealthScore(0.4)).toBe(44)
    expect(debtHealthScore(0.6)).toBe(16)
  })

  it('clamps into 0..100', () => {
    expect(debtHealthScore(0)).toBe(100)
    expect(debtHealthScore(-1)).toBe(100)
    expect(debtHealthScore(2)).toBe(0)
    expect(debtHealthScore(Infinity)).toBe(0)
  })

  it('maps to display verdict bands', () => {
    expect(verdictFromScore(80)).toBe('go')
    expect(verdictFromScore(50)).toBe('warn')
    expect(verdictFromScore(20)).toBe('danger')
  })
})

describe('monthsToAfford', () => {
  it('ceils the division', () => {
    expect(monthsToAfford(80000, 9000)).toBe(9)
  })
  it('guards non-positive saving capacity', () => {
    expect(monthsToAfford(80000, 0)).toBe(Infinity)
    expect(monthsToAfford(80000, -100)).toBe(Infinity)
  })
})

describe('prepaymentSavings', () => {
  it('produces positive interest + months saved for a real lump sum', () => {
    const res = prepaymentSavings(100000, 18, 24, 20000)
    expect(res.interestSaved).toBeGreaterThan(0)
    expect(res.monthsSaved).toBeGreaterThan(0)
  })

  it('never returns negative values, even with a zero lump sum', () => {
    const res = prepaymentSavings(100000, 18, 24, 0)
    expect(res.interestSaved).toBeGreaterThanOrEqual(0)
    expect(res.monthsSaved).toBeGreaterThanOrEqual(0)
  })

  it('clearing the whole balance saves the most', () => {
    const partial = prepaymentSavings(100000, 18, 24, 20000)
    const full = prepaymentSavings(100000, 18, 24, 100000)
    expect(full.interestSaved).toBeGreaterThan(partial.interestSaved)
  })
})

describe('payoffPlan', () => {
  const debts: Debt[] = [
    { name: 'Credit Card', balance: 40000, annualRatePct: 42, minPayment: 2000 },
    { name: 'Bike Loan', balance: 60000, annualRatePct: 11, minPayment: 3000 },
    { name: 'BNPL', balance: 15000, annualRatePct: 24, minPayment: 1500 },
  ]

  it('avalanche orders by interest rate descending', () => {
    const plan = payoffPlan(debts, 'avalanche', 4000)
    expect(plan.order).toEqual(['Credit Card', 'BNPL', 'Bike Loan'])
  })

  it('snowball orders by balance ascending', () => {
    const plan = payoffPlan(debts, 'snowball', 4000)
    expect(plan.order).toEqual(['BNPL', 'Credit Card', 'Bike Loan'])
  })

  it('reaches debt-free in a finite number of months and accrues interest', () => {
    const plan = payoffPlan(debts, 'avalanche', 4000)
    expect(plan.monthsToDebtFree).toBeGreaterThan(0)
    expect(plan.monthsToDebtFree).toBeLessThan(1200)
    expect(plan.totalInterest).toBeGreaterThan(0)
  })

  it('more extra money -> debt-free sooner', () => {
    const slow = payoffPlan(debts, 'avalanche', 1000)
    const fast = payoffPlan(debts, 'avalanche', 8000)
    expect(fast.monthsToDebtFree).toBeLessThan(slow.monthsToDebtFree)
  })

  it('handles an empty debt list', () => {
    const plan = payoffPlan([], 'avalanche', 1000)
    expect(plan.monthsToDebtFree).toBe(0)
    expect(plan.order).toEqual([])
  })
})

describe('cibilRateBand', () => {
  it('returns illustrative bands across the score range', () => {
    expect(cibilRateBand(820).minRate).toBe(10.5)
    expect(cibilRateBand(770).band).toBe('750–799')
    expect(cibilRateBand(720).maxRate).toBe(17)
    expect(cibilRateBand(670).minRate).toBe(17)
    expect(cibilRateBand(600).maxRate).toBe(28)
  })
})

describe('clamp', () => {
  it('bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(50, 0, 10)).toBe(10)
  })
})

describe('affordVerdict', () => {
  it('flags the flagship scenario red: ₹80k phone EMI (~₹7,565) on ₹30k income', () => {
    // emi(80000, 24, 12) ≈ 7564.77 → 25% of income → danger (plan §11)
    expect(affordVerdict(emi(80000, 24, 12), 30000)).toBe('danger')
  })
  it('is green when the EMI is a small slice of income', () => {
    expect(affordVerdict(2000, 30000)).toBe('go') // ~6.7%
  })
  it('warns in the 10–20% band', () => {
    expect(affordVerdict(4500, 30000)).toBe('warn') // 15%
  })
  it('treats zero/absent income as danger', () => {
    expect(affordVerdict(5000, 0)).toBe('danger')
  })
})

// ── v3 feedback pass ─────────────────────────────────────────────────────────

describe('disposableIncome + affordVerdictWithExpenses (fixed expenses)', () => {
  it('subtracts EMIs and fixed expenses', () => {
    expect(disposableIncome(95000, 12000, 70000)).toBe(13000)
  })

  it("Anmol's case: ₹95k − ₹12k EMI − ₹70k fixed → any real EMI is danger", () => {
    // disposable ₹13k; a ~₹7.5k EMI is 58% of it → danger
    expect(affordVerdictWithExpenses(7565, 95000, 12000, 70000)).toBe('danger')
  })

  it('no disposable income is always danger', () => {
    expect(affordVerdictWithExpenses(1, 50000, 20000, 30000)).toBe('danger')
    expect(affordVerdictWithExpenses(0, 50000, 20000, 40000)).toBe('danger')
  })

  it('honours the 30% / 50% bands on disposable income', () => {
    // disposable = 20000: 5000 -> 25% go, 8000 -> 40% warn, 12000 -> 60% danger
    expect(affordVerdictWithExpenses(5000, 50000, 10000, 20000)).toBe('go')
    expect(affordVerdictWithExpenses(8000, 50000, 10000, 20000)).toBe('warn')
    expect(affordVerdictWithExpenses(12000, 50000, 10000, 20000)).toBe('danger')
  })

  it('zero new EMI with positive disposable is go', () => {
    expect(affordVerdictWithExpenses(0, 50000, 10000, 20000)).toBe('go')
  })
})

describe('principalFromEmi (reverse of emi)', () => {
  it('round-trips with emi()', () => {
    const p = 100000
    const e = emi(p, 12, 12) // ≈ 8884.88
    expect(principalFromEmi(e, 12, 12)).toBeCloseTo(p, 0)
  })

  it('guards zero rate -> emi * months', () => {
    expect(principalFromEmi(1000, 0, 12)).toBe(12000)
  })

  it('guards non-positive inputs', () => {
    expect(principalFromEmi(0, 12, 12)).toBe(0)
    expect(principalFromEmi(5000, 12, 0)).toBe(0)
  })
})

describe('maxAffordableEmi + maxAffordablePrice (reverse affordability)', () => {
  it('caps EMI at 30% of disposable income by default', () => {
    // disposable = 20000 → 6000
    expect(maxAffordableEmi(50000, 10000, 20000)).toBe(6000)
  })

  it('never goes negative when over-committed', () => {
    expect(maxAffordableEmi(50000, 30000, 30000)).toBe(0)
  })

  it('turns a "no" into a real ceiling price', () => {
    const c = maxAffordablePrice(50000, 10000, 20000, 12, 12)
    expect(c.maxEmi).toBe(6000)
    expect(c.maxPrincipal).toBeGreaterThan(0)
    // that EMI at this rate/tenure re-derives to the principal
    expect(emi(c.maxPrincipal, 12, 12)).toBeCloseTo(6000, 0)
    expect(c.maxPrice).toBe(c.maxPrincipal) // no down payment
  })

  it('adds the down payment to the sticker price', () => {
    const c = maxAffordablePrice(50000, 10000, 20000, 12, 12, { downPayment: 15000 })
    expect(c.maxPrice).toBeCloseTo(c.maxPrincipal + 15000, 2)
  })
})

describe('emergencyRunwayMonths + bufferVerdict (job-loss safety)', () => {
  it('months of runway = savings / monthly obligations', () => {
    expect(emergencyRunwayMonths(300000, 20000, 30000)).toBe(6)
  })

  it('no obligations -> Infinity; no savings -> 0', () => {
    expect(emergencyRunwayMonths(100000, 0, 0)).toBe(Infinity)
    expect(emergencyRunwayMonths(0, 10000, 10000)).toBe(0)
  })

  it('verdict bands: >=6 go, 3–5.9 warn, <3 danger', () => {
    expect(bufferVerdict(6)).toBe('go')
    expect(bufferVerdict(4)).toBe('warn')
    expect(bufferVerdict(2.9)).toBe('danger')
  })
})

describe('recurringPrepaymentSavings (H)', () => {
  it('paying extra every month shortens tenure and saves interest', () => {
    const res = recurringPrepaymentSavings(500000, 18, 60, 5000)
    expect(res.interestSaved).toBeGreaterThan(0)
    expect(res.monthsSaved).toBeGreaterThan(0)
    expect(res.newTenureMonths).toBeLessThan(60)
  })

  it('zero extra changes nothing and never goes negative', () => {
    const res = recurringPrepaymentSavings(500000, 18, 60, 0)
    expect(res.interestSaved).toBe(0)
    expect(res.monthsSaved).toBe(0)
  })

  it('more extra per month saves more', () => {
    const small = recurringPrepaymentSavings(500000, 18, 60, 2000)
    const big = recurringPrepaymentSavings(500000, 18, 60, 10000)
    expect(big.monthsSaved).toBeGreaterThanOrEqual(small.monthsSaved)
    expect(big.interestSaved).toBeGreaterThan(small.interestSaved)
  })
})

describe('flat vs reducing interest (H)', () => {
  it('flat-rate interest exceeds reducing-balance for the same nominal rate', () => {
    const { reducing, flat } = interestByMethod(500000, 12, 60)
    expect(flat).toBeGreaterThan(reducing)
  })

  it('flat total interest = P * rate * years', () => {
    // 500000 @ 12% for 60mo (5y) = 300000
    expect(interestByMethod(500000, 12, 60).flat).toBeCloseTo(300000, 0)
  })

  it('flatEmi spreads principal + flat interest evenly', () => {
    // (500000 + 300000) / 60 = 13333.33
    expect(flatEmi(500000, 12, 60)).toBeCloseTo(13333.33, 1)
  })

  it('guards non-positive inputs', () => {
    expect(flatEmi(0, 12, 60)).toBe(0)
    expect(interestByMethod(500000, 12, 0)).toEqual({ reducing: 0, flat: 0 })
  })
})

describe('floatingRatePayoff (H)', () => {
  it('with no change it matches a fixed-rate loan', () => {
    const fixed = floatingRatePayoff(500000, 12, 60, 0, 12)
    const reducing = interestByMethod(500000, 12, 60).reducing
    expect(fixed.totalInterest).toBeCloseTo(reducing, 0)
    expect(fixed.finalEmi).toBeCloseTo(emi(500000, 12, 60), 0)
  })

  it('a rate hike raises total interest and the post-change EMI', () => {
    const flat = floatingRatePayoff(500000, 12, 60, 0, 12)
    const hiked = floatingRatePayoff(500000, 12, 60, 25, 15)
    expect(hiked.totalInterest).toBeGreaterThan(flat.totalInterest)
    expect(hiked.finalEmi).toBeGreaterThan(flat.finalEmi)
  })

  it('a rate cut lowers total interest', () => {
    const flat = floatingRatePayoff(500000, 12, 60, 0, 12)
    const cut = floatingRatePayoff(500000, 12, 60, 25, 9)
    expect(cut.totalInterest).toBeLessThan(flat.totalInterest)
  })
})
