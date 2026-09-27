import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'ink' | 'go' | 'warn' | 'danger' | 'pop' | 'paper'
type Size = 'sm' | 'md' | 'lg'

// Night-edition buttons: neon gradient primary, glowing solid accents.
const VARIANT: Record<Variant, string> = {
  ink: 'brand-fill text-white glow-brand',
  paper: 'bg-elev text-paper border border-line',
  go: 'bg-go text-[#04150c] glow-go',
  warn: 'bg-warn text-[#221700] glow-warn',
  danger: 'bg-danger text-white glow-danger',
  pop: 'brand-fill text-white glow-brand',
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
