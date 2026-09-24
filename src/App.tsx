import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RouterProvider, useRouter } from './lib/router'
import { ProProvider } from './lib/proContext'
import { AppShell } from './components/AppShell'
import { Onboarding } from './components/Onboarding'
import { getProfile } from './lib/storage'
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

  return (
    <RouterProvider>
      <ProProvider>
        {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}
        <AppShell>
          <CurrentScreen />
        </AppShell>
      </ProProvider>
    </RouterProvider>
  )
}
