import type { ReactNode } from 'react'
import { BrutalButton } from './BrutalButton'
import { PRO_PRICE_INR } from '../lib/pro'
import { usePro } from '../lib/proContext'

interface Props {
  children: ReactNode
  title?: string
  blurb?: string
}

/**
 * Gates Pro-only content. When unlocked, renders children. When locked, shows a
 * dimmed preview of the children behind a lock overlay with an Unlock CTA that
 * opens the paywall.
 */
export function ProLock({ children, title = 'Pro feature', blurb }: Props) {
  const { isProUnlocked, openPaywall } = usePro()

  if (isProUnlocked) return <>{children}</>

  return (
    <div className="relative overflow-hidden rounded-[14px] border-[3px] border-ink shadow-[6px_6px_0_var(--color-pop)]">
      {/* Dimmed, non-interactive preview */}
      <div
        className="pointer-events-none select-none opacity-40 blur-[2px]"
        aria-hidden
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper/70 p-6 text-center">
        <span className="text-4xl" aria-hidden>
          🔒
        </span>
        <h3 className="text-2xl font-black leading-none">{title}</h3>
        {blurb && <p className="max-w-[240px] font-display text-sm font-bold text-ink/70">{blurb}</p>}
        <BrutalButton variant="pop" onClick={openPaywall}>
          Unlock Pro · ₹{PRO_PRICE_INR}/mo
        </BrutalButton>
      </div>
    </div>
  )
}
