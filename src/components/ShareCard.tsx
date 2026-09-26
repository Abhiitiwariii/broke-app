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

const PAPER = '#f4f1ea'
const INK = '#16130e'
const THEME: Record<Verdict, { color: string; label: string }> = {
  go: { color: '#1c9d4e', label: 'APPROVED' },
  warn: { color: '#cf8400', label: 'THINK TWICE' },
  danger: { color: '#e5231b', label: 'DECLINED' },
}

/**
 * Fixed 1080×1350 export card. Rendered off-screen and captured to PNG by
 * ResultCard. Inline styles only (no Tailwind) so html-to-image serialises it
 * faithfully. Tabloid look: newsprint frame + boxed article + rubber stamp.
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
        backgroundColor: INK,
        color: INK,
        fontFamily: "'Archivo', system-ui, sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
      )}

      {/* Boxed article on the newsprint */}
      <div
        style={{
          position: 'absolute',
          inset: 60,
          backgroundColor: PAPER,
          border: `3px solid ${INK}`,
          boxShadow: `10px 10px 0 0 ${INK}`,
          padding: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Masthead */}
        <div>
          <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 0.9 }}>
            Broke<span style={{ color: '#e5231b' }}>?</span>
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6, marginTop: 10 }}>
            The daily ledger · find out before you are
          </div>
          <div style={{ borderBottom: `5px solid ${INK}`, marginTop: 16 }} />
        </div>

        {/* Verdict stamp */}
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              color: t.color,
              border: `7px solid ${t.color}`,
              boxShadow: `inset 0 0 0 3px ${t.color}`,
              borderRadius: 10,
              padding: '14px 34px',
              fontSize: 96,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              transform: 'rotate(-5deg)',
              opacity: 0.95,
            }}
          >
            {t.label}
          </span>
          <div style={{ fontSize: 46, fontWeight: 900, textTransform: 'uppercase', marginTop: 30, lineHeight: 1.05 }}>{headline}</div>
        </div>

        {/* Ledger + roast */}
        <div>
          <div
            style={{
              backgroundColor: INK,
              color: PAPER,
              padding: '24px 34px',
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'Space Mono', monospace",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            <span>{inr(price)}</span>
            <span>{inr(emi)}/mo</span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, textTransform: 'uppercase', marginTop: 24, lineHeight: 1.15 }}>
            “{roast}”
          </div>
        </div>
      </div>
    </div>
  )
})
