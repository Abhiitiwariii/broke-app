/**
 * Higgsfield art loader.
 *
 * Drop generated exports into `src/assets/higgsfield/` named by slot
 * (e.g. `today-hero.webp`, `afford-bg.webp`). Vite globs the folder at build
 * time, so a slot that has no file simply resolves to `null` and the component
 * renders its CSS/SVG fallback. A missing asset NEVER breaks the build or shows
 * a broken image — that's the contract that lets the design land before the art.
 */

const modules = import.meta.glob(
  '../assets/higgsfield/*.{webp,png,jpg,jpeg,avif,mp4,webm,svg}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

// Raster/video exports win over the built-in SVG stand-ins: drop a
// `today-hero.webp` next to `today-hero.svg` and it takes over automatically.
const bySlot: Record<string, string> = {}
const slotIsSvg: Record<string, boolean> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? ''
  const ext = (file.split('.').pop() ?? '').toLowerCase()
  const slot = file.replace(/\.[^.]+$/, '') // strip extension → slot name
  const isSvg = ext === 'svg'
  // Only overwrite an existing entry when the incoming file has higher priority
  // (non-svg beats svg). First writer wins among same-priority files.
  if (!(slot in bySlot) || (slotIsSvg[slot] && !isSvg)) {
    bySlot[slot] = url
    slotIsSvg[slot] = isSvg
  }
}

export type AssetSlot =
  | 'today-hero'
  | 'afford-bg'
  | 'escape-header'
  | 'share-bg'
  | 'verdict-go'
  | 'verdict-warn'
  | 'verdict-danger'

/** URL for a Higgsfield slot, or `null` if no file was dropped in yet. */
export function asset(slot: AssetSlot | string): string | null {
  return bySlot[slot] ?? null
}

/** Whether a Higgsfield asset exists for this slot. */
export function hasAsset(slot: AssetSlot | string): boolean {
  return slot in bySlot
}

/**
 * Whether the resolved asset is a real raster/photo render (webp/png/…) rather
 * than one of the built-in SVG stand-ins. Components use this to switch between
 * "framed hero image" (real render) and "subtle texture overlay" (SVG) treatments.
 */
export function isRealRender(slot: AssetSlot | string): boolean {
  return slot in bySlot && slotIsSvg[slot] === false
}
