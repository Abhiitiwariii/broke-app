import { useEffect, useRef, useState } from 'react'

/** Light haptic tap on supported mobile devices; silently no-ops elsewhere. */
export function haptic(ms = 12): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms)
  } catch {
    /* ignore */
  }
}

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Animate a number from 0 → value once on mount / when value changes. */
export function useCountUp(value: number, duration = 700): number {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(0)
  useEffect(() => {
    if (!Number.isFinite(value)) {
      setDisplay(value)
      return
    }
    if (reduceMotion()) {
      setDisplay(value)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (value - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return display
}
