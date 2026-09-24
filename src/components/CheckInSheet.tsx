import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PiggyBank, Wallet, Ban, type LucideIcon } from 'lucide-react'
import { BrutalButton } from './BrutalButton'
import { NumberField } from './NumberField'
import { haptic } from '../lib/ui'
import type { CheckInKind } from '../lib/daily'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (spent: number, kind: CheckInKind) => void
}

const KINDS: {
  kind: CheckInKind
  Icon: LucideIcon
  label: string
  on: string // active container classes
  ic: string // active icon color
}[] = [
  { kind: 'saved', Icon: PiggyBank, label: 'Saved', on: 'border-go bg-go/20 text-paper', ic: 'text-go' },
  { kind: 'spent', Icon: Wallet, label: 'Spent', on: 'border-warn bg-warn/20 text-paper', ic: 'text-warn' },
  { kind: 'resisted', Icon: Ban, label: 'Resisted', on: 'border-pop bg-pop/20 text-paper', ic: 'text-pop' },
]

/** Daily Money Check-in bottom sheet. */
export function CheckInSheet({ open, onClose, onSubmit }: Props) {
  const [kind, setKind] = useState<CheckInKind>('spent')
  const [spent, setSpent] = useState<number | ''>('')

  useEffect(() => {
    if (open) { setKind('spent'); setSpent('') }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit() {
    haptic(18)
    const amount = kind === 'resisted' ? 0 : spent === '' ? 0 : spent
    onSubmit(amount, kind)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close check-in" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Daily money check-in"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full max-w-[460px] rounded-t-[28px] border-t border-line bg-card p-6 pb-8"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
            <h2 className="text-3xl font-black leading-none text-paper">Today's check-in</h2>
            <p className="mt-1 font-display font-bold text-paper/55">Keep the streak. How did money go today?</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {KINDS.map((k) => {
                const active = kind === k.kind
                const { Icon } = k
                return (
                  <button
                    key={k.kind}
                    type="button"
                    onClick={() => { haptic(); setKind(k.kind) }}
                    className={[
                      'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 font-display text-xs font-black uppercase transition-colors',
                      active ? k.on : 'border-line bg-elev text-paper/60',
                    ].join(' ')}
                  >
                    <Icon className={['h-6 w-6', active ? k.ic : 'text-paper/60'].join(' ')} />
                    {k.label}
                  </button>
                )
              })}
            </div>

            {kind !== 'resisted' ? (
              <div className="mt-4">
                <NumberField label={kind === 'saved' ? 'Amount saved today' : 'Amount spent today'} value={spent} onChange={setSpent} placeholder="0" />
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-go/40 bg-go/10 p-3 font-display text-sm font-bold text-paper/85">
                You walked away from a purchase. That's a win — no rupees logged.
              </p>
            )}

            <div className="mt-6">
              <BrutalButton variant="ink" size="lg" full onClick={submit}>Lock in today →</BrutalButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
