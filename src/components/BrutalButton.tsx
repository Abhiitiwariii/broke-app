import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'ink' | 'go' | 'warn' | 'danger' | 'pop' | 'paper'
type Size = 'sm' | 'md' | 'lg'

// Tabloid buttons: solid ink/red blocks with a hard offset shadow.
const HARD = 'border-[1.5px] border-paper shadow-[3px_3px_0_0_var(--color-paper)]'
const VARIANT: Record<Variant, string> = {
  ink: `brand-fill text-white ${HARD}`,
  paper: `bg-elev text-paper ${HARD}`,
  go: `bg-go text-white ${HARD}`,
  warn: `bg-warn text-white ${HARD}`,
  danger: `bg-danger text-white ${HARD}`,
  pop: `brand-fill text-white ${HARD}`,
}

const SIZE: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
}

interface Props extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  variant?: Variant
  size?: Size
  full?: boolean
}

/** Premium pill button: soft glow, springy press. */
export function BrutalButton({
  children,
  variant = 'ink',
  size = 'md',
  full = false,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={[
        'inline-flex items-center justify-center gap-2 font-display font-extrabold uppercase tracking-tight',
        'rounded-full select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        full ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
