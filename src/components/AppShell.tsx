import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Flame, ShoppingBag, TrendingDown, UserRound, type LucideIcon } from 'lucide-react'
import { useRouter, type Route } from '../lib/router'

const NAV: { route: Route; label: string; Icon: LucideIcon }[] = [
  { route: 'today', label: 'Today', Icon: Flame },
  { route: 'afford', label: 'Afford', Icon: ShoppingBag },
  { route: 'debt', label: 'Debt', Icon: TrendingDown },
  { route: 'me', label: 'Me', Icon: UserRound },
]

/** Mobile-first dark frame: top wordmark bar, scroll region, floating glass nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const { route, navigate } = useRouter()

  return (
    <div className="relative mx-auto flex h-full min-h-screen w-full max-w-[460px] flex-col bg-bg sm:my-4 sm:min-h-0 sm:h-[calc(100vh-2rem)] sm:border-[1.5px] sm:border-paper sm:shadow-[8px_8px_0_0_var(--color-paper)] overflow-hidden">
      {/* Top bar / nameplate */}
      <header className="z-20 flex items-center justify-between border-b-[1.5px] border-paper bg-bg px-4 py-2.5">
        <button type="button" onClick={() => navigate('today')} className="flex items-center gap-2">
          <span className="brand-fill flex h-8 w-8 items-center justify-center rounded-[4px] border-[1.5px] border-paper font-display text-lg font-black text-white">
            ?
          </span>
          <span className="grad-text font-display text-xl font-black uppercase tracking-tight">Broke?</span>
        </button>
        <span className="num text-[9px] font-bold uppercase tracking-[0.2em] text-paper/50">The daily ledger</span>
      </header>

      {/* Scroll region */}
      <main id="app-scroll" className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {children}
      </main>

      {/* Bottom nav — boxed masthead strip */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-3">
        <div className="pointer-events-auto flex gap-1 border-[1.5px] border-paper bg-bg p-1.5 shadow-[4px_4px_0_0_var(--color-paper)]">
          {NAV.map((item) => {
            const active = route === item.route
            const { Icon } = item
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className="relative flex flex-col items-center gap-0.5 rounded-[3px] px-5 py-2 font-display text-[10px] font-black uppercase tracking-tight"
              >
                {active && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute inset-0 rounded-[3px] bg-paper"
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                )}
                <Icon className={['relative h-[18px] w-[18px]', active ? 'text-ink' : 'text-paper/55'].join(' ')} strokeWidth={2.5} />
                <span className={['relative', active ? 'text-ink' : 'text-paper/55'].join(' ')}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
