import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = ['#22C55E', '#F5B400', '#6C5CE7', '#FF3B30', '#12100E']

/**
 * Brutalist confetti burst — hard-edged squares fired from the centre. Renders
 * once (keyed by the caller) and animates out. Pointer-events off.
 */
export function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const dist = 120 + Math.random() * 180
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 60,
          rotate: Math.random() * 720 - 360,
          color: COLORS[i % COLORS.length],
          size: 10 + Math.random() * 12,
          delay: Math.random() * 0.08,
        }
      }),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            border: '2px solid #12100E',
          }}
        />
      ))}
    </div>
  )
}
