# Broke? — Build Plan (self-contained)

> This file is the single source of truth for building the app. A design/build sub-agent
> reads ONLY this file for context, so everything needed is here. Environment is Windows,
> Node v24 + npm 11 available, PowerShell primary shell.

---

## 0. What we're building (one paragraph)

**Broke?** is a mobile-first PWA that gives young Indians (Gen Z, 15–29) a brutally honest,
screenshot-worthy reality check on money. Two free pillars: **"Can you afford it?"** (pick a
thing you want → instant 🟢/🟡/🔴 verdict) and a **Debt Health Score** (are you sliding into a
trap?). A ₹99/mo **Pro** tier sells the *fix*: personalized debt-payoff plans, prepayment
hacks, and a debt-trap escape roadmap. Tagline: **"find out before you are."** Free = "are you
broke?"; Pro = "how to un-broke."

Aesthetic: **neo-brutalist** — thick black borders, hard offset shadows, loud flat color
blocks, oversized chunky type — with **springy motion** so it feels alive, not stiff. Built to
grow through shareable result cards and to monetize via subscription + tightly-scoped (mocked)
affiliate links.

## 1. Locked product decisions

| Decision | Choice |
|---|---|
| Name / tagline | **Broke?** — "find out before you are." |
| Audience | Gen-Z Indians; loans they actually take: phone/laptop/bike EMIs, BNPL, first credit card, personal & education loans |
| Form factor | Mobile-first **PWA** (installable, no app store) |
| Aesthetic | Neo-brutalist + springy Framer Motion |
| Monetization | ₹99/mo **Pro**, unlock **MOCKED** (localStorage flag, Razorpay-ready) + tightly-scoped **mocked** affiliate links |
| Stack | Vite + React + TypeScript + Tailwind + Framer Motion → deploy Vercel; all data in **localStorage** (no backend) |
| Scope build-1 | 2 free pillars + Pro paywall + 3 Pro features, production-grade, runs + builds clean |

## 2. Tech setup

- Scaffold: `npm create vite@latest . -- --template react-ts` **inside** this folder (`broke app`).
  Because the folder name has a space, run all npm/node commands from inside the folder path
  quoted. If tooling chokes on the space, create the Vite app in a subfolder `app/` instead and
  keep `plan.md` at the top — decide at build time, document what you did.
- Add deps: `tailwindcss @tailwindcss/postcss postcss autoprefixer framer-motion`
  (Tailwind v4 uses `@tailwindcss/postcss`), `vite-plugin-pwa` for the PWA manifest + service
  worker, `vitest` for unit tests.
- Fonts (Google Fonts, via index.html `<link>`): display = **Archivo** or **Space Grotesk**
  (heavy weights 700/800), body = same family regular. Keep to ONE family, use weight for
  hierarchy — very brutalist.

## 3. Design tokens (put in `src/index.css` as CSS vars + Tailwind theme)

```
--paper:      #F4F1EA   (off-white base)
--ink:        #12100E   (near-black text/borders)
--go:         #22C55E   (🟢 safe / acid green)
--warn:       #F5B400   (🟡 caution / amber)
--danger:     #FF3B30   (🔴 broke / hot red)
--pop:        #6C5CE7   (secondary accent, used sparingly for Pro)
--card:       #FFFFFF
border:       3px solid var(--ink)
shadow:       6px 6px 0 var(--ink)   (hard offset, NO blur)
radius:       14px (chunky, not pill)
```
Motion rules: springy press (`whileTap={{ scale: 0.96 }}`), card entrances with spring, a
**confetti burst on 🟢**, a **shake on 🔴**. Prefer transform/opacity only.

Anti-AI-slop: NO purple-blue gradients, NO glassmorphism, NO vague blobs, NO generic SaaS hero.
The one memorable quality: verdicts feel like a friend roasting you honestly.

## 4. The finance engine — `src/lib/finance.ts` (pure functions, unit-tested, no UI)

```ts
// r = monthly rate = annualRatePct / 1200
emi(principal, annualRatePct, months): number
  = principal * r * (1+r)**months / ((1+r)**months - 1)   // guard r===0 -> principal/months

foir(totalMonthlyEmis, netMonthlyIncome): number   // ratio 0..>1
// Bands: <0.40 🟢 safe | 0.40–0.50 🟡 caution | >0.50 🔴 danger  (RBI-aligned)
verdictFromFoir(ratio): 'go' | 'warn' | 'danger'

debtHealthScore(foir): number
  = clamp(round(100 - foir*140), 0, 100)   // 40%->~44, 60%->~16
// Score bands for display: >=60 🟢 | 40–59 🟡 | <40 🔴

monthsToAfford(targetPrice, monthlySavingCapacity): number   // ceil, guard <=0

prepaymentSavings(principal, annualRatePct, months, lumpSum): { interestSaved, monthsSaved }
  // re-amortize: total interest of original schedule minus total interest after applying lumpSum
  // to principal (recompute months to clear at same EMI). Both outputs >= 0.

payoffPlan(debts: {name, balance, annualRatePct, minPayment}[], strategy: 'avalanche'|'snowball',
           extraPerMonth): { order: string[], monthsToDebtFree, totalInterest, timeline }
  // avalanche = sort by annualRatePct desc; snowball = sort by balance asc.
  // Simulate month by month applying minPayments + extra rolled onto the current target.

cibilRateBand(score: number): { band: string, minRate, maxRate }
  // 800+  -> 10.5–12% | 750–799 -> 12–14% | 700–749 -> 14–17%
  // 650–699 -> 17–22% | <650 -> 22–28%   (illustrative personal-loan bands; label as estimates)
```
**Every rupee-affecting formula lives here.** Screens only call these and render.

## 5. Data & persistence — `src/lib/storage.ts`
- `localStorage` keys: `broke.profile` (income, optional cibil), `broke.debts` (array),
  `broke.isPro` (bool), `broke.history` (past checks, Pro).
- Typed get/set helpers wrapped in try/catch (private-mode safe), sensible defaults on read.

## 6. Paywall & commercial — `src/lib/pro.ts` + `src/data/partners.ts`
- `isPro()` / `unlockPro()` / `lockPro()` toggle `broke.isPro`. `unlockPro()` is the single
  seam where a real **Razorpay/UPI** call goes later — for now it just flips the flag after the
  PaywallSheet "Unlock ₹99/mo" tap (simulate a 1.2s "processing" state for realism).
- `partners.ts`: mocked registry `{ id, label, kind: 'consolidation'|'nocost-emi'|'card', url:'#', note }`.
  Rendered ONLY inside genuinely money-saving contexts (Escape Plan consolidation step; no-cost-EMI
  suggestion on a 🔴 Afford Check). Clearly labeled "Partner offer • estimate", never "take another loan".

## 7. Screens (React Router or simple state router) — `src/screens/`

1. **Home** — bold logo lockup "Broke?" + tagline, two giant brutalist cards: **"Can I afford it?"**
   and **"Am I in a debt trap?"**. Footer chip: install PWA / "Pro" badge if unlocked.
2. **AffordCheck** — step 1 pick a want (grid: 📱 Phone, 💻 Laptop, 🏍️ Bike, 🎓 Course, ➕ Custom ₹)
   with typical prices from `src/data/wants.ts`; step 2 income (+ optional existing EMIs, CIBIL);
   → **ResultCard**: 🟢/🟡/🔴 verdict, EMI, one plain-English roast line, "months till you can
   comfortably afford it", CIBIL rate band, **Share** button (export card as PNG via html-to-image
   or canvas), and (if 🔴) a no-cost-EMI partner nudge + CTA to Debt Health.
3. **DebtHealth** — add multiple debts (name, balance, rate, EMI) + income → **ScoreDial**
   (0–100 animated) + traffic light + "X% of your income is debt" line. Below: a **locked**
   "Your escape plan" teaser → opens Paywall.
4. **EscapePlan (Pro)** — gated by `isPro()`. Tabs/sections:
   - **Debt Payoff Optimizer** (avalanche vs snowball toggle → order + months-to-free + interest).
   - **Prepayment Optimizer** (pick a debt + lump sum slider → "prepay ₹X → save ₹Y & N months").
   - **Debt-Trap Escape Plan** (narrative roadmap out of 🔴 with a target date; consolidation step
     shows a mocked partner offer).
   - Locked "coming soon" cards: No-Cost/Lower-EMI Finder, Consolidation Check, "Don't buy it yet"
     coach, Saved scenarios & compare, PDF/Excel export, personalized CIBIL bands.
5. **Paywall (PaywallSheet)** — bottom sheet: ₹99/mo Pro, bullet value, "Unlock" → mock processing
   → `unlockPro()` → route to EscapePlan.

## 8. Components — `src/components/`
`BrutalButton`, `BrutalCard`, `VerdictBadge` (go/warn/danger), `ScoreDial` (animated arc),
`ResultCard` (+ shareable variant), `PaywallSheet`, `ProLock` (wraps gated content), `ShareCard`
(export-styled), `NumberField` (₹ input with formatting), `AppShell` (mobile frame + nav).

## 9. Visual assets (best-effort, don't block the build)
Generate via available image skills (fal-generate/imagegen) if API access works in the sub-agent;
otherwise use **CSS/SVG** brutalist marks (totally acceptable for this style) so the build never
blocks on image gen:
- App/PWA icons (192/512 maskable) — a bold "Broke?" mark on red.
- Want-tile icons — can be emoji or simple SVG.
- Share-card background — brutalist pattern in CSS/SVG; dynamic text drawn over it.
Screens themselves are CODED, not generated images.

## 10. Build order (do in this sequence)
1. Scaffold Vite react-ts in this folder; add Tailwind v4 + PostCSS + framer-motion + vite-plugin-pwa + vitest.
2. Tokens + `AppShell` + fonts + global brutalist styles.
3. `finance.ts` + **Vitest tests** (write tests, make them pass) — this is the trustworthy core.
4. `storage.ts`, `pro.ts`, `partners.ts`, `wants.ts`.
5. Home → AffordCheck → ResultCard (with share PNG) → confetti/shake motion.
6. DebtHealth → ScoreDial → locked teaser.
7. Paywall + EscapePlan (3 Pro features) with ProLock gating.
8. PWA manifest + icons; verify installable.
9. Polish: hover/focus/active/disabled states, mobile+desktop widths, empty/error states.

## 11. Verification (must pass before "done")
1. `npm run test` (Vitest) green: EMI vs a known amortization value; FOIR band boundaries;
   `prepaymentSavings` > 0; avalanche orders by rate desc; score clamps 0–100.
2. `npm run dev`: ₹80k phone on ₹30k income → 🔴 with a correct EMI; DebtHealth with 3 debts →
   score + band; Paywall → mock unlock → EscapePlan renders payoff + prepayment; reload → Pro
   state persists.
3. Responsive at 375px and 1280px; no overflow/overlap; all interactive states present.
4. `npm run build` clean; note the Vercel deploy command (`vercel` / connect repo) for later.

## 12. Out of scope (build-1)
Real Razorpay payments, live affiliate integrations, accounts/backend, Account Aggregator import,
the locked "coming soon" Pro features, marketing videos.

## 13. Attribution (if committing)
Commit trailer:
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_011qtJ3iZbvLyTLvQN38XfyV
```
Do NOT commit or push unless the user asks.
