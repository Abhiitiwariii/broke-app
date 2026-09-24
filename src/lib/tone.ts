/**
 * Broke? — roast copy, tone-aware.
 *
 * Two personalities the user toggles in Me:
 *   - honest  (default): straight, encouraging, still a little cheeky.
 *   - brutal          : no mercy, on-brand roast. Never abusive — punches at the
 *                       decision, not the person.
 *
 * Pure string helpers only. No finance math lives here (that stays in finance.ts).
 */
import type { Verdict } from './finance'
import { inr, humanMonths } from './format'

export type RoastTone = 'honest' | 'brutal'

/** Verdict on a specific want ("can I afford this phone?"). */
export function affordRoast(verdict: Verdict, label: string, tone: RoastTone): string {
  const thing = label.toLowerCase()
  if (tone === 'brutal') {
    switch (verdict) {
      case 'go':
        return `Fine. The ${thing} won't bury you. Flex responsibly.`
      case 'warn':
        return `You *can* buy the ${thing}. You also *can* regret it by the 5th. Your call.`
      case 'danger':
        return `Bro. This ${thing} owns you, not the other way round. Hard pass.`
    }
  }
  switch (verdict) {
    case 'go':
      return `That ${thing} is comfortably within reach. Enjoy the flex.`
    case 'warn':
      return `You can swing this ${thing}, but it'll pinch. Sleep on it a week.`
    case 'danger':
      return `This EMI eats your month alive. That ${thing} can wait.`
  }
}

/** Emergency-buffer resilience readout. `months` may be Infinity. */
export function bufferRoast(verdict: Verdict, months: number, tone: RoastTone): string {
  const runway = Number.isFinite(months) ? humanMonths(Math.round(months)) : 'ages'
  if (tone === 'brutal') {
    switch (verdict) {
      case 'go':
        return `Lose the job tomorrow and you'd still coast ${runway}. Rare. Respect.`
      case 'warn':
        return `${runway} of runway. One bad quarter from panic. Pad the cushion.`
      case 'danger':
        return `${runway} if income stops. That's not a buffer, that's a countdown.`
    }
  }
  switch (verdict) {
    case 'go':
      return `Strong cushion — about ${runway} of runway if income paused.`
    case 'warn':
      return `Okay cushion — roughly ${runway}. Aim for 6 months to feel safe.`
    case 'danger':
      return `Thin cushion — only ${runway} if income stopped. Build this first.`
  }
}

/** Reverse-afford line shown when a want is out of reach. */
export function reverseAffordRoast(maxPrice: number, tone: RoastTone): string {
  if (maxPrice <= 0) {
    return tone === 'brutal'
      ? "Right now? ₹0 on EMI. Your money's already spoken for."
      : 'Right now there’s no room for a new EMI — clear some first.'
  }
  return tone === 'brutal'
    ? `What you can *actually* swing today: about ${inr(maxPrice)}. Shop that shelf.`
    : `What fits your budget today: about ${inr(maxPrice)}.`
}
