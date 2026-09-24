/**
 * Indicative loan-rate presets for 5 major Indian banks.
 *
 * These are *starting points only* — real sanctioned rates depend on credit
 * score, tenure, loan amount and the bank's current card rates, and they move
 * often. The UI must show every preset as editable and label it "indicative —
 * edit to your rate" so nobody mistakes it for a live quote.
 */

export interface BankPreset {
  id: string
  name: string
  /** Indicative home-loan rate (annual %). Editable in the UI. */
  homeLoanRate: number
  /** Indicative personal-loan rate (annual %). Editable in the UI. */
  personalLoanRate: number
}

export const BANK_RATE_DISCLAIMER =
  'Indicative rates only — edit to your actual sanctioned rate.'

export const BANK_PRESETS: BankPreset[] = [
  { id: 'sbi', name: 'SBI', homeLoanRate: 8.5, personalLoanRate: 11.5 },
  { id: 'hdfc', name: 'HDFC Bank', homeLoanRate: 8.75, personalLoanRate: 10.75 },
  { id: 'icici', name: 'ICICI Bank', homeLoanRate: 8.75, personalLoanRate: 10.85 },
  { id: 'axis', name: 'Axis Bank', homeLoanRate: 8.9, personalLoanRate: 11.25 },
  { id: 'kotak', name: 'Kotak Mahindra', homeLoanRate: 8.85, personalLoanRate: 10.99 },
]
