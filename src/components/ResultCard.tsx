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
import { asset, isRealRender } from '../lib/assets'
import { haptic } from '../lib/ui'

const VERDICT_LINE: Record<Verdict, string> = {
  go: 'I can afford it 🟢',
  warn: 'I should think twice 🟡',
  danger: "I'm broke for this 🔴",
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

const GLOW: Record<Verdict, string> = { go: 'glow-go', warn: 'glow-warn', danger: 'glow-danger' }
const ACCENT: Record<Verdict, string> = { go: 'text-go', warn: 'text-warn', danger: 'text-danger' }
const ART_SLOT: Record<Verdict, string> = {
  go: 'verdict-go',
  warn: 'verdict-warn',
  danger: 'verdict-danger',
}

/** Verdict result: huge gem centerpiece + roast + stats + share. */
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

  const art = asset(ART_SLOT[verdict])
  const artReal = isRealRender(ART_SLOT[verdict])

  async function renderPng(): Promise<string | null> {
    if (!shareRef.current) return null
    return toPng(shareRef.current, { pixelRatio: 1, cacheBust: true })
  }

  async function handleWhatsApp() {
    setBusy(true); setError(null); haptic()
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
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className={['card overflow-hidden', GLOW[verdict], verdict === 'danger' ? 'animate-shake' : ''].join(' ')}
      >
        {/* Huge gem centerpiece */}
        <div className="relative flex items-center justify-center bg-bg pt-6 pb-2">
          {art ? (
            <motion.img
              src={art}
              alt=""
              aria-hidden
              initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.05 }}
              className={[
                artReal ? 'h-56 w-auto object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]' : 'h-40 w-full object-cover opacity-40',
              ].join(' ')}
            />
          ) : (
            <div className="halftone h-40 w-full" />
          )}
        </div>

        <div className="p-6 pt-2">
          <VerdictBadge verdict={verdict} size="lg" />
          <p className="mt-4 text-2xl font-black leading-tight text-paper">"{roast}"</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat label={`EMI × ${months} mo`} value={`${inr(emi)}/mo`} accent={ACCENT[verdict]} />
            <Stat label="Sticker price" value={inr(price)} />
            <Stat label="Save-up-instead" value={humanMonths(affordInMonths)} />
            <Stat label="Likely rate" value={`${cibilBand.minRate}–${cibilBand.maxRate}%`} />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-paper/45">
            Rate band is an estimate from your CIBIL tier ({cibilBand.band}); real rates vary by lender.
          </p>

          <div className="mt-5 flex gap-2">
            <BrutalButton variant="go" full onClick={handleWhatsApp} disabled={busy}>
              <Share2 className="h-4 w-4" /> {busy ? '…' : 'Share'}
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
    <div className="rounded-2xl border border-line bg-elev px-4 py-3">
      <div className="font-display text-[10px] font-bold uppercase tracking-wide text-paper/45">{label}</div>
      <div className={['font-display text-lg font-black tabular-nums', accent ?? 'text-paper'].join(' ')}>{value}</div>
    </div>
  )
}
