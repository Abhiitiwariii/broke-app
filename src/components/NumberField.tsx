import { useId } from 'react'

interface Props {
  label: string
  value: number | ''
  onChange: (value: number | '') => void
  prefix?: string
  suffix?: string
  placeholder?: string
  min?: number
  max?: number
  hint?: string
}

/** Dark labelled numeric input with ₹ prefix support. */
export function NumberField({
  label,
  value,
  onChange,
  prefix = '₹',
  suffix,
  placeholder = '0',
  min,
  max,
  hint,
}: Props) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block font-display text-xs font-extrabold uppercase tracking-wide text-paper/60">
        {label}
      </span>
      <div className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-elev transition-colors focus-within:border-pop">
        {prefix && (
          <span className="flex items-center bg-white/5 px-3.5 font-display text-lg font-black text-paper/70">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') return onChange('')
            const n = Number(raw)
            onChange(Number.isFinite(n) ? n : '')
          }}
          className="w-full min-w-0 bg-transparent px-3.5 py-3 font-display text-xl font-bold text-paper outline-none placeholder:text-paper/25"
        />
        {suffix && (
          <span className="flex items-center px-3.5 font-display text-sm font-bold uppercase text-paper/45">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-xs font-semibold text-paper/45">{hint}</span>}
    </label>
  )
}
