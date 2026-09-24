import { createContext, useContext, useState, type ReactNode } from 'react'

export type Route = 'today' | 'afford' | 'debt' | 'escape' | 'me'

interface RouterState {
  route: Route
  params: Record<string, string>
  navigate: (route: Route, params?: Record<string, string>) => void
}

const RouterContext = createContext<RouterState | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('today')
  const [params, setParams] = useState<Record<string, string>>({})

  const navigate = (to: Route, p: Record<string, string> = {}) => {
    setRoute(to)
    setParams(p)
    // scroll the app frame to top on navigation
    requestAnimationFrame(() => {
      document.getElementById('app-scroll')?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    })
  }

  return (
    <RouterContext.Provider value={{ route, params, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}
