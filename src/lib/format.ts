/** Money & number formatting helpers (Indian conventions). */

/** ₹ with Indian grouping, no decimals. e.g. 125000 -> "₹1,25,000" */
export function inr(n: number): string {
  if (!Number.isFinite(n)) return '₹—'
  const rounded = Math.round(n)
  return '₹' + rounded.toLocaleString('en-IN')
}

/** Compact rupees for big numbers: 125000 -> "₹1.25L", 5000000 -> "₹50L", 12000000 -> "₹1.2Cr" */
export function inrCompact(n: number): string {
  if (!Number.isFinite(n)) return '₹—'
  const abs = Math.abs(n)
  if (abs >= 1e7) return '₹' + trimZero(n / 1e7) + 'Cr'
  if (abs >= 1e5) return '₹' + trimZero(n / 1e5) + 'L'
  if (abs >= 1e3) return '₹' + trimZero(n / 1e3) + 'K'
  return inr(n)
}

function trimZero(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '')
}

/** "N months" -> friendly duration like "1 yr 3 mo". */
export function humanMonths(months: number): string {
  if (!Number.isFinite(months)) return 'never'
  if (months <= 0) return 'now'
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} mo`
  if (m === 0) return `${y} yr`
  return `${y} yr ${m} mo`
}

/** Percent with one decimal. 0.4523 -> "45.2%" */
export function pct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  return (ratio * 100).toFixed(1) + '%'
}
