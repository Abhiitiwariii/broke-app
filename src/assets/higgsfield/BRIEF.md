# Higgsfield generation brief — "Broke?"

Everything the code needs is already wired. **You generate the art in your Higgsfield
account, export it, and drop the files into this exact folder** (`src/assets/higgsfield/`)
named exactly as the "File" column says. The loader (`src/lib/assets.ts`) picks them up
automatically on the next `npm run build` / `npm run dev`. A missing file is fine — the
screen falls back to its CSS/SVG treatment, so nothing ever breaks.

## Rules (read once)
- **Format:** WebP preferred (PNG fine). Keep each file **< 250 KB** — this is an installable
  PWA, image weight matters. Compress before dropping in.
- **Naming is literal:** `today-hero.webp`, not `Today Hero (1).webp`.
- **One art direction across all of them** so the app reads as a single system.
- **Leave the safe-zones empty.** The app draws the text/numbers on top; art is a backdrop.

## Model + settings
Use Higgsfield **Soul** (or the highest-quality photoreal model). Generate 4, upscale the best.
Set the **aspect ratio** per asset (table below). Style = cinematic 3D product render.

## The house style (paste this into every prompt as the BASE)
> Ultra-premium 3D gamified fintech art for a Gen-Z India money app. Cinematic studio product
> render: glossy, tactile 3D objects — gold ₹ rupee coins, a sleek matte payment card, glowing
> progress rings, reward gems and badges, a stylised streak flame — floating in soft depth with
> volumetric light, gentle bokeh and subtle floating particles. Deep rich background with a smooth
> vignette and one vivid accent glow. Photoreal materials: brushed gold, frosted glass, soft-touch
> plastic, subsurface glow. Feels like CRED meets a beautiful mobile-game reward screen —
> aspirational, "collectible", high-end. Clean hero composition, generous negative space. Colour
> palette: ink black #12100E base, off-white #F4F1EA, hot red #FF3B30, acid green #22C55E,
> gold/amber #F5B400, violet #6C5CE7. 8k, octane render, sharp focus, premium colour grade.

## Negative prompt (paste into Higgsfield's negative field, or add "avoid:" at the end)
> newsprint, halftone dots, flat vector, 2D illustration, low detail, cluttered, busy, ugly,
> watermark, any text, letters, words, numbers, typography, cartoon mascot, chibi, kids
> illustration, toy plastic, cheap render, distorted, blurry, oversaturated.

The gamified feel comes from the **objects and light** (coins, gems, rings, flames, sparks, glow),
never from cartoon characters. Keep it premium.

---

## Slots to generate

| File | Where it shows | Aspect / size | Safe-zone |
|------|----------------|---------------|-----------|
| `today-hero.webp` | Today screen hero backdrop (behind the greeting + streak) | 3:2 · **1080×720** | top-left clear for wordmark, center clear for the allowance ring |
| `afford-bg.webp` | AffordCheck full-screen wash (behind the form) | 9:16 · **1080×1920** | dark, low-contrast, mostly empty — atmosphere only |
| `escape-header.webp` | EscapePlan (Pro) header band | ~16:9 · **1080×600** | left third darker/clear for the title |
| `share-bg.webp` | ShareCard export background (what people post) | 4:5 · **1080×1350** | big clean glowing center for the verdict + numbers |
| `verdict-go.webp` | 🟢 result card art | 1:1 · **800×800** | centered hero object on a dark backdrop |
| `verdict-warn.webp` | 🟡 result card art | 1:1 · **800×800** | centered hero object on a dark backdrop |
| `verdict-danger.webp` | 🔴 result card art | 1:1 · **800×800** | centered hero object on a dark backdrop |

> Note: I'll **re-tune each screen's overlay** (opacity, blend mode, dark scrims) when you drop the
> real renders in, so these richer/darker images shine instead of being crushed by the current
> flat-art settings. Just drop them and say "assets in".

Optional (PWA install icon upgrade — these go in `public/` + manifest, not this folder; ping me to wire):
`icon-512.png`, `maskable-512.png` — refined "Broke?" mark, 512×512.

---

## Copy-paste prompts (paste BASE first, then the line below, then the NEGATIVE)

**today-hero.webp** (1080×720, 3:2) — hero backdrop, keep top-left + center calm
> Hero shot: a glowing 3D circular progress ring wrapped around a stylised premium flame
> (a streak), with a small stack of shiny gold ₹ rupee coins beside it, floating over a deep
> ink-black scene lit by a warm amber-to-red accent glow, soft particles rising, cinematic depth.
> "Levelling up your money" energy. Leave the upper-left and center calm and darker for UI text.

**afford-bg.webp** (1080×1920, 9:16) — sits DARK + low-contrast behind a form
> Very subtle full-screen background: a deep ink-to-charcoal gradient with one soft accent glow
> in a corner and a few heavily-blurred bokeh gold ₹ coins far in the background. Extremely low
> contrast, mostly empty dark atmospheric space so form fields read clearly on top. Calm, premium.

**escape-header.webp** (1080×600, 16:9) — premium Pro band, left third clear
> Premium Pro header: a sleek 3D staircase of glowing violet light steps rising toward a bright
> horizon, a debt chain snapping apart into gold ₹ coins and sparks, deep violet-to-ink
> background, volumetric god-rays, luxurious "debt-free escape" mood. Keep the left third darker
> and clear for a title.

**share-bg.webp** (1080×1350, 4:5) — big clean glowing center for the numbers
> A shareable "flex card" background: dramatic dark studio scene with a vivid accent glow and
> premium 3D reward elements — gold ₹ coins, a shining badge, subtle confetti sparks — arranged
> around the EDGES, leaving a large clean, softly-glowing center safe-zone empty for big numbers.
> High-end mobile-game reward-screen energy.

**verdict-go.webp** (800×800, 1:1) — centered hero object
> Triumphant 3D reward: a radiant acid-green gem or medal with gold ₹ coins and confetti sparks
> bursting outward, bright green glow, dark backdrop, celebratory "win / level up" energy.

**verdict-warn.webp** (800×800, 1:1) — centered hero object
> Cautious 3D scene: a glowing amber gem or a single gold ₹ coin teetering on an edge, warm amber
> light, a few floating coins, tense "think twice" mood, dark premium backdrop.

**verdict-danger.webp** (800×800, 1:1) — centered hero object
> High-alert 3D scene: a cracked glowing red gem and gold ₹ coins slipping out of an open wallet,
> intense red glow with sparks, dramatic dark backdrop, urgent "broke" energy — still premium.

---

## After you drop files in
```bash
cd "C:\Users\tabhi\Downloads\broke app"
npm run build   # confirms the art loads + stays under budget
npm run dev     # eyeball each screen
```
No code changes needed — just drop, build, done.
