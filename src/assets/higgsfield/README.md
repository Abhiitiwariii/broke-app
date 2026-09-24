# Higgsfield art drop-zone

👉 **Full generation brief with copy-paste prompts + sizes: [`BRIEF.md`](./BRIEF.md).**

Export your Higgsfield-generated visuals here, named by **slot** (the loader in
`src/lib/assets.ts` maps `filename-without-extension` → slot):

| File name | Slot | Used by |
|-----------|------|---------|
| `today-hero.webp` | `today-hero` | Today screen hero backdrop |
| `afford-bg.webp` | `afford-bg` | AffordCheck background |
| `escape-header.webp` | `escape-header` | EscapePlan (Pro) header |
| `share-bg.webp` | `share-bg` | ShareCard export background |
| `verdict-go.webp` / `verdict-warn.webp` / `verdict-danger.webp` | `verdict-*` | ResultCard per verdict |

Rules:
- Prefer **WebP**, keep each file **< 250 KB** (this is a PWA — image weight matters).
- A missing file is fine: the component falls back to its CSS/SVG treatment automatically.
- No code change needed to add art — just drop the file in and rebuild.
