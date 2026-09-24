import { forwardRef } from 'react'
import type { Verdict } from '../lib/finance'
import { inr } from '../lib/format'
import { asset } from '../lib/assets'

interface Props {
  verdict: Verdict
  headline: string
  price: number
  emi: number
  roast: string
}

const THEME: Record<Verdict, { bg: string; ink: string; emoji: string; label: string }> = {
  go: { bg: '#22C55E', ink: '#12100E', emoji: '🟢', label: 'GO FOR IT' },
  warn: { bg: '#F5B400', ink: '#12100E', emoji: '🟡', label: 'THINK TWICE' },
  danger: { bg: '#FF3B30', ink: '#F4F1EA', emoji: '🔴', label: "YOU'RE BROKE" },
}

/**
 * Fixed 1080×1350 export-styled result card. Rendered off-screen and captured
 * to PNG by ResultCard. Uses inline styles (no Tailwind) so html-to-image
 * serialises it faithfully regardless of the surrounding stylesheet.
 */
export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  { verdict, headline, price, emi, roast },
  ref,
) {
  const t = THEME[verdict]
  const bg = asset('share-bg')
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: 1080,
        height: 1350,
        backgroundColor: t.bg,
        color: t.ink,
        fontFamily: "'Archivo', system-ui, sans-serif",
        padding: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        border: '16px solid #12100E',
        overflow: 'hidden',
      }}
    >
      {bg && (
        <img
          src={bg}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.22,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.03em' }}>
          Broke<span style={{ color: verdict === 'danger' ? '#12100E' : '#FF3B30' }}>?</span>
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.75, marginTop: 8 }}>
          find out before you are.
        </div>
      </div>

      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: 180, lineHeight: 1 }}>{t.emoji}</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            marginTop: 12,
            textTransform: 'uppercase',
          }}
        >
          {t.label}
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 24 }}>{headline}</div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            backgroundColor: '#12100E',
            color: '#F4F1EA',
            borderRadius: 18,
            padding: '28px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          <span>{inr(price)}</span>
          <span>{inr(emi)}/mo</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 28, lineHeight: 1.2 }}>
          "{roast}"
        </div>
      </div>
    </div>
  )
})
