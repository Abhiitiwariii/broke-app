/**
 * Pro tier gating (plan.md §6).
 *
 * `unlockPro()` is the SINGLE seam where a real Razorpay/UPI charge goes later.
 * For build-1 it just flips a localStorage flag after a simulated ~1.2s
 * "processing" delay so the paywall feels real.
 */
import { getIsPro, setIsPro } from './storage'

export const PRO_PRICE_INR = 99

export function isPro(): boolean {
  return getIsPro()
}

export function lockPro(): void {
  setIsPro(false)
}

/**
 * Simulate a payment. In production, replace the body with a Razorpay order +
 * checkout, and only call setIsPro(true) on a verified success webhook/callback.
 */
export async function unlockPro(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200))
  // --- Razorpay seam ---------------------------------------------------
  // const order = await createRazorpayOrder(PRO_PRICE_INR)
  // const ok = await openRazorpayCheckout(order)
  // if (!ok) throw new Error('Payment cancelled')
  // ---------------------------------------------------------------------
  setIsPro(true)
}
