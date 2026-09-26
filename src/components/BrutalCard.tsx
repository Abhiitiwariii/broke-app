import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props extends HTMLMotionProps<'div'> {
  children: ReactNode
  color?: string // tailwind bg class, e.g. 'bg-card' | 'bg-pop'
  shadow?: 'sm' | 'md' | 'lg' | 'pop'
  entrance?: boolean
}

/** Elevated card with the shared `.card` finish (gradient + inner highlight + depth). */
export function BrutalCard({
  children,
  color = 'bg-card',
  shadow = 'md',
  entrance = false,
  className = '',
  ...rest
}: Props) {
  void shadow
  // `bg-card` (default) → the .card finish; a real color override keeps its own bg.
  const base = color === 'bg-card' ? 'card' : `rounded-[22px] border border-line ${color}`
  return (
    <motion.div
      initial={entrance ? { opacity: 0, y: 18, scale: 0.98 } : false}
      animate={entrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={[base, className].join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
