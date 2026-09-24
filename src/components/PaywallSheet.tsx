import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrutalButton } from './BrutalButton'
import { PRO_PRICE_INR, unlockPro } from '../lib/pro'
import { usePro } from '../lib/proContext'
import { useRouter } from '../lib/router'

const VALUE_BULLETS = [
  ['🧭', 'Debt-payoff optimizer', 'Avalanche vs snowball — exact order + months to free.'],
  ['💸', 'Prepayment hacks', 'See what a lump sum really saves you in interest & time.'],
  ['🪜', 'Debt-trap escape plan', 'A step-by-step roadmap out of the red, with a target date.'],
]

/** Bottom-sheet paywall. Wired to the ProProvider's open/close state. */
export function PaywallSheet() {
  const { paywallOpen, closePaywall, markPro } = usePro()
  const { navigate } = useRouter()
  const [processing, setProcessing] = useState(false)

  // Close on Escape.
  useEffect(() => {
    if (!paywallOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !processing && closePaywall()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paywallOpen, processing, closePaywall])

  async function handleUnlock() {
    setProcessing(true)
    try {
      await unlockPro() // ~1.2s mock; real Razorpay seam lives here later
      markPro()
      closePaywall()
      navigate('escape')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {paywallOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close paywall"
            disabled={processing}
            onClick={() => !processing && closePaywall()}
            className="absolute inset-0 bg-ink/50"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Unlock Broke? Pro"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full max-w-[460px] rounded-t-[22px] border-[3px] border-ink bg-paper p-6 pb-8 shadow-[0_-9px_0_var(--color-ink)]"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/30" />

            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black leading-none">
                Un-broke<span className="text-pop"> yourself.</span>
              </h2>
              <div className="text-right">
                <div className="font-display text-2xl font-black">₹{PRO_PRICE_INR}</div>
                <div className="font-display text-[11px] font-bold uppercase tracking-wide text-ink/60">
                  per month
                </div>
              </div>
            </div>

            <p className="mt-2 font-display font-bold text-ink/70">
              Free tells you if you're broke. Pro shows you how to fix it.
            </p>

            <ul className="mt-4 flex flex-col gap-3">
              {VALUE_BULLETS.map(([emoji, title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-2xl" aria-hidden>
                    {emoji}
                  </span>
                  <span>
                    <span className="block font-display font-black">{title}</span>
                    <span className="block text-sm font-semibold text-ink/65">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <BrutalButton
                variant="pop"
                size="lg"
                full
                disabled={processing}
                onClick={handleUnlock}
              >
                {processing ? 'Processing…' : `Unlock Pro · ₹${PRO_PRICE_INR}/mo`}
              </BrutalButton>
              <p className="mt-2 text-center text-[11px] font-semibold text-ink/50">
                Demo unlock — no real payment. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
