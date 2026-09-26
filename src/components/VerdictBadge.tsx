import type { Verdict } from '../lib/finance'

const MAP: Record<Verdict, { label: string; color: string }> = {
  go: { label: 'APPROVED', color: 'text-go' },
  warn: { label: 'THINK TWICE', color: 'text-warn' },
  danger: { label: 'DECLINED', color: 'text-danger' },
}

interface Props {
  verdict: Verdict
  label?: string
  size?: 'sm' | 'md' | 'lg'
  /** Play the slam-in animation (verdict reveal). */
  slam?: boolean
}

/** Rubber-stamp verdict — pressed onto the paper, rotated, ink-distressed. */
export function VerdictBadge({ verdict, label, size = 'md', slam = false }: Props) {
  const v = MAP[verdict]
  const sizing =
    size === 'lg'
      ? 'text-4xl'
      : size === 'sm'
        ? 'text-base'
        : 'text-2xl'
  return (
    <span
      className={[
        'stamp',
        slam ? 'stamp-slam' : '',
        v.color,
        sizing,
      ].join(' ')}
    >
      {label ?? v.label}
    </span>
  )
}
