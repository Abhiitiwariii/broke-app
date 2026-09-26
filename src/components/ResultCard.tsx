import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import { Download, Share2 } from 'lucide-react'
import type { CibilBand, Verdict } from '../lib/finance'
import { inr, humanMonths } from '../lib/format'
import { BrutalButton } from './BrutalButton'
import { VerdictBadge } from './VerdictBadge'
import { Confetti } from './Confetti'
import { ShareCard } from './ShareCard'
import { shareImage } from '../lib/share'
import { haptic } from '../lib/ui'
import { track } from '../lib/analytics'

const VERDICT_LINE: Record<Verdict, string> = {
  go: 'APPROVED ✅',
  warn: 'THINK TWICE ⚠️',
  danger: 'DECLINED ⛔',
}

interface Props {
  verdict: Verdict
  headline: string
  price: number
  emi: number
  months: number
  roast: string
  affordInMonths: number
  cibilBand: CibilBand
}

const ACCENT: Record<Verdict, string> = { go: 'text-go', warn: 'text-warn', danger: 'text-danger' }

/** Verdict result: rubber-stamp headline + roast + ledger stats + share. */
export function ResultCard({
  verdict,
  headline,
  price,
  emi,
  months,
  roast,
  affordInMonths,
  cibilBand,
}: Props) {
  const shareRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function renderPng(): Promise<string | null> {
    if (!shareRef.current) return null
    return toPng(shareRef.current, { pixelRatio: 1, cacheBust: true })
  }

  async function handleWhatsApp() {
    setBusy(true); setError(null); haptic(); track('verdict_shared', { verdict })
    try {
      const dataUrl = await renderPng()
      const caption = `${VERDICT_LINE[verdict]} — ${headline}. Find out yours on Broke?`
      await shareImage({ dataUrl: dataUrl ?? undefined, text: caption, filename: 'broke-verdict.png' })
    } catch {
      setError('Could not open share. Try a screenshot instead.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDownload() {
    setBusy(true); setError(null); haptic()
    try {
      const dataUrl = await renderPng()
      if (!dataUrl) return
      const link = document.createElement('a')
      link.download = 'broke-verdict.png'
      link.href = dataUrl
      link.click()
    } catch {
      setError('Could not generate the image. Try a screenshot instead.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      {verdict === 'go' && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={['card overflow-hidden', verdict === 'danger' ? 'animate-shake' : ''].join(' ')}
      >
        {/* Masthead kicker */}
        <div className="flex items-center justify-between bg-paper px-5 py-2">
          <span className="font-display text-[11px] font-black uppercase tracking-[0.22em] text-ink">The Verdict</span>
          <span className="num text-[10px] uppercase tracking-widest text-ink/60">Broke? · Special Edition</span>
        </div>

        {/* Rubber stamp */}
        <div className="flex justify-center px-6 pb-2 pt-8">
          <VerdictBadge verdict={verdict} size="lg" slam />
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-center font-display text-2xl font-black uppercase leading-[1.05]">“{roast}”</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat label={`EMI × ${months} mo`} value={`${inr(emi)}/mo`} accent={ACCENT[verdict]} />
            <Stat label="Sticker price" value={inr(price)} />
            <Stat label="Save-up-instead" value={humanMonths(affordInMonths)} />
            <Stat label="Likely rate" value={`${cibilBand.minRate}–${cibilBand.maxRate}%`} />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-paper/50">
            Rate band is an estimate from your CIBIL tier ({cibilBand.band}); real rates vary by lender.
          </p>

          <div className="mt-5 flex gap-2">
            <BrutalButton variant="danger" full onClick={handleWhatsApp} disabled={busy}>
              <Share2 className="h-4 w-4" /> {busy ? '…' : 'Share the receipt'}
            </BrutalButton>
            <BrutalButton variant="paper" onClick={handleDownload} disabled={busy} aria-label="Download image">
              <Download className="h-4 w-4" />
            </BrutalButton>
          </div>
          {error && <p className="mt-2 text-center text-xs font-bold text-danger">{error}</p>}
        </div>
      </motion.div>

      {/* Off-screen export target */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <ShareCard ref={shareRef} verdict={verdict} headline={headline} price={price} emi={emi} roast={roast} />
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border-[1.5px] border-paper bg-elev px-4 py-3">
      <div className="font-display text-[10px] font-black uppercase tracking-wide text-paper/55">{label}</div>
      <div className={['num text-lg font-bold', accent ?? 'text-paper'].join(' ')}>{value}</div>
    </div>
  )
}
