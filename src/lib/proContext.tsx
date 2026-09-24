import { createContext, useContext, type ReactNode } from 'react'

interface ProState {
  /** React mirror of the localStorage Pro flag, so screens re-render on unlock. */
  isProUnlocked: boolean
  /** Flip the in-memory flag after a successful (mocked) unlock. */
  markPro: () => void
  /** Bottom-sheet paywall visibility. */
  paywallOpen: boolean
  openPaywall: () => void
  closePaywall: () => void
}

const ProContext = createContext<ProState | null>(null)

/**
 * Pro is fully unlocked for the MVP — no paywall, everything free. The context
 * shape is kept as a seam so pricing can be re-introduced later without touching
 * every screen; for now `isProUnlocked` is always true and the paywall is a no-op.
 */
export function ProProvider({ children }: { children: ReactNode }) {
  return (
    <ProContext.Provider
      value={{
        isProUnlocked: true,
        markPro: () => {},
        paywallOpen: false,
        openPaywall: () => {},
        closePaywall: () => {},
      }}
    >
      {children}
    </ProContext.Provider>
  )
}

export function usePro(): ProState {
  const ctx = useContext(ProContext)
  if (!ctx) throw new Error('usePro must be used within ProProvider')
  return ctx
}
