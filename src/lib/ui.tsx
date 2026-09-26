import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

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

/**
 * Pointer-parallax tilt. Spread the returned handlers on an element and attach
 * `ref`; the element rotates toward the cursor for a floating, 3D feel. Mutates
 * the transform directly (no re-render) and no-ops under reduced-motion / touch.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 8): {
  ref: RefObject<T>
  onPointerMove: (e: PointerEvent<T>) => void
  onPointerLeave: () => void
} {
  const ref = useRef<T>(null) as RefObject<T>
  const onPointerMove = (e: PointerEvent<T>) => {
    const el = ref.current
    if (!el || reduceMotion() || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(760px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
  }
  const onPointerLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }
  return { ref, onPointerMove, onPointerLeave }
}

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
