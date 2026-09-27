import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RouterProvider, useRouter } from './lib/router'
import { ProProvider } from './lib/proContext'
import { AppShell } from './components/AppShell'
import { Onboarding } from './components/Onboarding'
import { Login } from './components/Login'
import { getProfile } from './lib/storage'
import { supabase, isSupabaseConfigured, type Session } from './lib/supabase'
import { initAnalytics, identifyUser, track, resetAnalytics } from './lib/analytics'
import { startSync, stopSync } from './lib/sync'
import { Today } from './screens/Today'
import { AffordCheck } from './screens/AffordCheck'
import { DebtHealth } from './screens/DebtHealth'
import { EscapePlan } from './screens/EscapePlan'
import { Me } from './screens/Me'

function CurrentScreen() {
  const { route } = useRouter()
  const screen =
    route === 'afford' ? (
      <AffordCheck />
    ) : route === 'debt' ? (
      <DebtHealth />
    ) : route === 'escape' ? (
      <EscapePlan />
    ) : route === 'me' ? (
      <Me />
    ) : (
      <Today />
    )

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {screen}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() => getProfile().netMonthlyIncome > 0)
  // undefined = still resolving the Supabase session; null = signed out.
  const [session, setSession] = useState<Session | null | undefined>(
    isSupabaseConfigured ? undefined : null,
  )
  const [devBypass, setDevBypass] = useState(false)

  useEffect(() => {
    initAnalytics()
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (s?.user) {
        identifyUser(s.user.id)
        if (event === 'SIGNED_IN') track('login_success')
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') void startSync(s.user.id)
      } else if (event === 'SIGNED_OUT') {
        stopSync()
        resetAnalytics()
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const resolving = isSupabaseConfigured && session === undefined
  const needsLogin = isSupabaseConfigured && session === null && !devBypass
  // Login gates everything: people sign in first, then onboard, then use the app.
  const showLogin = !resolving && needsLogin
  const showOnboarding = !resolving && !needsLogin && !onboarded

  return (
    <RouterProvider>
      <ProProvider>
        <AppShell>
          <CurrentScreen />
        </AppShell>

        {showLogin && <Login onSkip={() => setDevBypass(true)} />}

        {showOnboarding && (
          <Onboarding
            onDone={() => {
              setOnboarded(true)
              track('onboarding_complete')
            }}
          />
        )}
      </ProProvider>
    </RouterProvider>
  )
}
