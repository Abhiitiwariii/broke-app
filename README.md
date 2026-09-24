# Broke?

**find out before you are.** A mobile-first money app for Gen-Z India — check if you can *actually* afford it, score your debt trap, and build a daily money-check-in streak.

Dark, premium, gamified. Runs fully on-device (localStorage) — no account, no server.

## Features
- **Today** — daily allowance ring + streak, one-tap money check-in.
- **Afford check** — expense-aware verdict (income − EMIs − fixed bills), reverse-afford ("what you *can* buy now"), emergency runway.
- **Debt trap** — health score from your debts.
- **Escape plan** — payoff optimizer (avalanche/snowball), prepayment lab (lump/recurring, reducing-vs-flat, floating-rate), bank presets.
- **Me** — weekly trends, roast-tone toggle, privacy, export/delete data.

## Stack
Vite · React · TypeScript · Tailwind v4 · Framer Motion · lucide-react · vite-plugin-pwa. Visuals generated in Higgsfield, wired with CSS/SVG fallbacks.

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest — finance engine (64 tests)
npm run build    # tsc + vite build
```

## Deploy
Static SPA — deploys to Vercel with zero config (framework preset: Vite; build `npm run build`; output `dist`).
