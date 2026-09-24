import type { Verdict } from '../lib/finance'

const MAP: Record<Verdict, { emoji: string; label: string; bg: string; text: string }> = {
  go: { emoji: '🟢', label: 'GO FOR IT', bg: 'bg-go', text: 'text-ink' },
  warn: { emoji: '🟡', label: 'THINK TWICE', bg: 'bg-warn', text: 'text-ink' },
  danger: { emoji: '🔴', label: "YOU'RE BROKE", bg: 'bg-danger', text: 'text-paper' },
}

interface Props {
  verdict: Verdict
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function VerdictBadge({ verdict, label, size = 'md' }: Props) {
  const v = MAP[verdict]
  const sizing =
    size === 'lg'
      ? 'px-5 py-2 text-2xl'
      : size === 'sm'
        ? 'px-3 py-1 text-sm'
        : 'px-4 py-1.5 text-lg'
  return (
    <span
      className={[
        'inline-flex items-center gap-2 font-display font-extrabold uppercase tracking-tight',
        'rounded-full',
        v.bg,
        v.text,
        sizing,
      ].join(' ')}
    >
      <span aria-hidden>{v.emoji}</span>
      {label ?? v.label}
    </span>
  )
}
