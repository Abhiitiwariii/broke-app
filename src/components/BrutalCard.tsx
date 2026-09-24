import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props extends HTMLMotionProps<'div'> {
  children: ReactNode
  color?: string // tailwind bg class, e.g. 'bg-card' | 'bg-pop'
  shadow?: 'sm' | 'md' | 'lg' | 'pop'
  entrance?: boolean
}

// Soft depth for dark UI (no more hard offset shadows).
const SHADOW = {
  sm: 'shadow-[0_10px_24px_-18px_#000]',
  md: 'shadow-[0_18px_38px_-22px_#000]',
  lg: 'shadow-[0_26px_54px_-24px_#000]',
  pop: 'shadow-[0_0_44px_-12px_var(--color-pop)]',
}

/** Elevated dark card with a hairline border and soft depth. */
export function BrutalCard({
  children,
  color = 'bg-card',
  shadow = 'md',
  entrance = false,
  className = '',
  ...rest
}: Props) {
  return (
    <motion.div
      initial={entrance ? { opacity: 0, y: 18, scale: 0.98 } : false}
      animate={entrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={[
        'rounded-[18px] border border-line',
        SHADOW[shadow],
        color,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
