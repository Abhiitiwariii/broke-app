# Broke? — Progress

_Last updated: 2026-09-06_

## Status: 🟡 Build in progress (sub-agent running in background)

---

## ✅ Done
- **Repo recon** — `Abhiitiwariii/loansense-india-marketplace` is a stale placeholder (README describes a LoanSense loan-coach plugin, but actual code is leftover "World Clock" boilerplate). Decision: build fresh, reuse the loan-math concept.
- **Grilling / decisions locked:**
  - Name: **Broke?** — tagline "find out before you are."
  - Audience: Gen-Z Indians (15–29); loans they actually take (phone/laptop/bike EMIs, BNPL, first card, personal/education loans).
  - Form factor: mobile-first **PWA**.
  - Aesthetic: **neo-brutalist** + springy Framer Motion.
  - Monetization: ₹99/mo **Pro**, unlock **mocked** (localStorage, Razorpay-ready) + tightly-scoped **mocked** affiliate links.
  - Stack: Vite + React + TS + Tailwind + Framer Motion → Vercel; localStorage, no backend.
  - Visual assets: I generate them via built-in image skills (fal/imagegen), CSS/SVG fallback — no paid tools (skipped Higgsfield as costly/overkill).
- **Folder created:** `C:\Users\tabhi\Downloads\broke app\`
- **`plan.md` written** — self-contained build spec (product, finance formulas, tokens, screens, build order, verification).
- **Design/build sub-agent dispatched** — reads `plan.md`, building the app end-to-end in the background.

## 🔄 In progress (sub-agent)
Building from `plan.md`, build order:
1. Scaffold Vite react-ts + Tailwind v4 + Framer Motion + vite-plugin-pwa + Vitest
2. Design tokens + AppShell + fonts
3. `finance.ts` + passing Vitest tests
4. storage / pro / partners / wants data
5. Home → AffordCheck → ResultCard (share PNG) + confetti/shake
6. DebtHealth → ScoreDial → locked teaser
7. Paywall + EscapePlan (3 Pro features) with ProLock gating
8. PWA manifest + icons
9. Polish (states, responsive, empty/error)

Gate before "done": `npm run test` green **and** `npm run build` clean.

## ⏭️ Next (after sub-agent returns)
- Review the build; run `npm run dev` and eyeball the flows.
- Confirm verification scenarios (₹80k phone on ₹30k income → 🔴).
- Then, on user's call: Vercel deploy, wire real **Razorpay/UPI** into `unlockPro()`, real affiliate partners.

## 📌 Out of scope (build-1)
Real payments, live affiliate, accounts/backend, Account Aggregator import, locked "coming soon" Pro features, marketing videos.

## 🔗 Key paths
- Plan: `C:\Users\tabhi\Downloads\broke app\plan.md`
- App (being scaffolded): `C:\Users\tabhi\Downloads\broke app\`
- Source repo (placeholder): github.com/Abhiitiwariii/loansense-india-marketplace

---

# 🛠️ Build log (owned by build sub-agent from here down)

## Decisions
- Built the Vite app **in place** at the repo root (not a subfolder), so `npm run dev` runs directly from `C:\Users\tabhi\Downloads\broke app`. Scaffolded files manually (no interactive `npm create vite`) to avoid prompts in the non-empty folder (plan.md + progress.md already present).
- Router: **lightweight state router** (no react-router dep) via a small React context — fewer deps, less build risk (plan allowed either).
- Fonts: **Archivo** (single family, weights 400–900) via Google Fonts `<link>` — brutalist "one family, weight for hierarchy".
- Share-to-PNG: `html-to-image` dependency.

## Step 1 — Scaffold ✅
- Files: `package.json`, `vite.config.ts` (react + vite-plugin-pwa + vitest config), `postcss.config.js` (@tailwindcss/postcss + autoprefixer), `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`, `index.html` (Archivo font + PWA meta), `src/vite-env.d.ts`.
- `npm install` → exit 0 (deps incl. tailwindcss v4, framer-motion, vite-plugin-pwa, vitest, jsdom, html-to-image).

## Step 2 — Tokens + globals ✅
- `src/index.css`: Tailwind v4 `@theme` with all §3 tokens (paper/ink/go/warn/danger/pop/card, radius 14px, hard 6px shadows, Archivo). Brutalist base styles, chunky focus ring, brutalist range slider, shake keyframes, subtle flat grid texture (no gradients). `prefers-reduced-motion` respected.

## Step 3 — Finance engine + tests ✅
- `src/lib/finance.ts`: pure functions per §4 — `emi`, `foir`, `verdictFromFoir`, `debtHealthScore`, `verdictFromScore`, `monthsToAfford`, `prepaymentSavings` (simulated amortization, outputs clamped ≥0), `payoffPlan` (avalanche/snowball month-by-month sim with rollover + interest + timeline), `cibilRateBand`, `clamp`.
- `src/lib/finance.test.ts`: 22 Vitest tests. First run: 21/22 green; 1 fail was a **wrong expected literal in the test** (₹80k@24%/12mo is 7564.77, not 7559.55 — engine was correct). Fixed the literal. (Primary known-value check ₹1,00,000@12%/12mo ≈ ₹8,884.88 passed.)

## Step 4 — Data/persistence layer ✅
- `src/lib/storage.ts` (try/catch localStorage, sensible defaults), `src/lib/pro.ts` (`isPro`/`unlockPro` with 1.2s mock delay = Razorpay seam/`lockPro`), `src/lib/format.ts` (INR / compact / months / pct), `src/data/wants.ts`, `src/data/partners.ts` (mocked, labelled "Partner offer • estimate").

## Steps 5–9 — UI (in progress)
- Components done: `BrutalButton`, `BrutalCard`, `VerdictBadge`, `ScoreDial`, `NumberField`, `Confetti`.
- Remaining: router + AppShell, ProLock, PaywallSheet, ResultCard/ShareCard, screens (Home/AffordCheck/DebtHealth/EscapePlan), App wiring, PWA icons, then `npm run test` + `npm run build` gate.

---

# ⏸️ PAUSED — RESUME TOMORROW (2026-09-06)

Build was **paused by user** to continue tomorrow. Sub-agent stopped cleanly mid-UI. Nothing is broken — the app just isn't wired up end-to-end yet.

## Where it stands
- **✅ Complete & solid:** scaffold + deps installed (`node_modules` present), design tokens/globals, **finance engine + 22 passing Vitest tests**, storage/pro/format/data layers.
- **🔄 In progress:** UI. Components built: `BrutalButton`, `BrutalCard`, `VerdictBadge`, `ScoreDial`, `NumberField`, `Confetti`.
- **⬜ Not yet built:** router + `AppShell`, `ProLock`, `PaywallSheet`, `ResultCard`/`ShareCard`, the 4 screens (Home / AffordCheck / DebtHealth / EscapePlan), top-level `App` wiring, PWA icons. **App will NOT run end-to-end yet** — `App.tsx` still needs the screens wired in.

## To resume tomorrow (exact next steps, in order)
1. Open a Claude Code session in `C:\Users\tabhi\Downloads\broke app` and say: *"resume the Broke? build from progress.md — finish steps 5–9."*
2. Build order to finish: (a) router context + `AppShell`, (b) `ProLock` + `PaywallSheet`, (c) `ResultCard` + `ShareCard` (html-to-image), (d) screens Home → AffordCheck → DebtHealth → EscapePlan, (e) wire `App.tsx`, (f) PWA icons/manifest.
3. **Gate before "done":** `npm run test` (should stay green, 22 tests) AND `npm run build` (must be clean).
4. Then `npm run dev` and eyeball: ₹80k phone on ₹30k income → 🔴; DebtHealth 3 debts → score; Paywall → mock unlock → EscapePlan.

## Run commands (folder name has a space — keep the quotes)
```powershell
cd "C:\Users\tabhi\Downloads\broke app"
npm run test    # verify finance engine still green
npm run dev     # NOTE: won't be a full app until screens are wired (step 5–9)
```

## Not done / deferred
- No git commit/push, no Vercel deploy (left for user).
- Real Razorpay + real affiliate partners still mocked (by design for build-1).

---

# ✅ RESUMED & COMPLETED (2026-09-21)

Steps 5–9 finished. App runs end-to-end; `npm run test` (26 green) and `npm run build` both clean.

## Built this session
- **Wiring:** `src/main.tsx` (entry), `src/App.tsx` (RouterProvider → ProProvider → AppShell +
  AnimatePresence page transitions + PaywallSheet), `src/lib/proContext.tsx` (React mirror of the
  Pro flag + paywall open/close state).
- **Components:** `AppShell` (mobile frame, `#app-scroll`, chunky colored-block bottom nav),
  `ProLock`, `PaywallSheet` (mock unlock → navigate escape), `ResultCard` (confetti/shake + share),
  `ShareCard` (fixed 1080×1350, `html-to-image` PNG export), `Marquee`.
- **Screens:** `Home`, `AffordCheck`, `DebtHealth`, `EscapePlan` (payoff + prepayment + roadmap +
  coming-soon). All use existing lib/data + primitives.
- **PWA icons:** `public/favicon.svg` + `public/icon.svg`; manifest/vite.config point at the SVG
  mark (any + maskable) — no missing-PNG 404s.

## Two decisions made
1. **Afford verdict scoring (spec gap):** plan §11 wanted ₹80k phone / ₹30k income → 🔴, but pure
   RBI FOIR scores that 25% ratio as 🟢. Added `affordVerdict()` to `finance.ts` — tighter
   discretionary bands (<10% 🟢 / 10–20% 🟡 / >20% 🔴) so the flagship case reads 🔴 as intended.
   DebtHealth still uses the RBI FOIR bands. Locked with 4 new tests.
2. **Design pass:** user flagged the first cut as too plain. Committed to a "tabloid-brutalist"
   identity — hot-red halftone hero + oversized wordmark, black scrolling ticker, colored pillar
   cards with index watermarks + hover-lift, rotated sticker tags, chunky colored-block nav.
   Kit lives in `src/index.css` (`.tag`, `.halftone`, `.stripes`, `.watermark`, `.lift`,
   `.marquee`, `.highlight`).

## Still open / next
- **Visual eyeball pending user** — dev server was left running (localhost:5173, HMR live).
- Deferred (unchanged): Razorpay/UPI, real affiliates, git commit, Vercel deploy.

---

# ✅ v2 — DAILY-HABIT LOOP (2026-09-22)

Grilling session → `daily-habit-spec.md` (source of truth for v2). App now opens on a
daily **Today** dashboard, not a menu. `npm run test` = **39 green** (26 finance + 13 daily),
`npm run build` clean.

## Also fixed this session
- **EMI bug (DebtHealth):** it made you type your EMI. Now you enter balance + ROI + tenure and
  it computes EMI via the tested `emi()`; the computed EMI drives the score + payoff plan.

## Built (v2)
- `src/lib/daily.ts` (+ 13 tests): `todayKey`, `daysInMonth`, `dailyAllowance`, `spentOn`,
  `applyCheckIn` (streak logic w/ freeze), `streakState`.
- `storage.ts`: `broke.settings` / `broke.streak` / `broke.checkins` get/set + `addCheckin`.
- Components: `DailyWidgets` (`StreakFlame`, `AllowanceRing` burn-down), `CheckInSheet`.
- Screens: `Today` (streak + allowance ring + one-tap check-in + quick tiles) and `Me`
  (streak history, savings-goal slider, Pro perks gated, install hint, reset data).
- Router → routes `today | afford | debt | escape | me`, default `today`; `AppShell` 4-tab nav.
- Removed dead `Home.tsx` + `Marquee.tsx` (replaced by Today).

## Retention model (as built)
- Daily action = Money Check-in (spent/saved/resisted) → allowance burn-down + streak.
- Streak rewards **showing up**, not success; over-budget = a roast, not a broken streak.
- Allowance = (income − EMIs − savings goal) ÷ days in month; savings goal default 20% (Me screen).
- Free = habit + afford-check + debt score. Pro (₹99) = Escape Plan + streak-freeze/trends/challenges (perks gated as stubs).

## v2 deferred (per spec)
Push/WhatsApp notifications, backend/accounts, real payments, spend auto-import, full Pro
trends/freeze/challenges (currently gated stubs). Aesthetic is toned-brutalist + CRED-ish
hero depth; further polish possible.

---

# 🟡 v3 — FEEDBACK PASS (planning, 2026-09-24)

Source: LinkedIn launch feedback (`Feedback.txt`) + new user asks. Grilling session in
progress. **Status: PLANNING — 2 forks + Q8/Q9 still open, nothing built yet.**

## Feedback / requirements extracted
| # | Theme | Origin | Ask |
|---|-------|--------|-----|
| A | Fixed monthly expenses | Anmol Sahetya | Afford math must subtract fixed expenses, not just EMIs. Example: ₹95k salary, ₹12k EMI, ₹70k fixed → "can't afford". |
| B | Emergency buffer / job-loss | Nagamaheswara | If income stops, can they still service the EMI? Months of runway. |
| C | Future income growth | Nagamaheswara | Should affordability rise with expected salary growth? **DEFERRED — own pass.** |
| D | Privacy / security | Mayank | When does check run (before/after signup), how is data protected. App is localStorage-only = strong story currently untold. |
| E | Personality / roast tone | Tushar | Verdicts with attitude, on-brand for "Broke?". |
| F | Optional login / save | User | Let people save data if they wish. |
| G | Reverse affordability | User | When "can't afford", show the actual amount they CAN afford now. |
| H | Prepayment v2 | User | Recurring monthly-prepay → new tenure + interest saved; select interest type; 5 major Indian bank presets. |

## Decisions LOCKED
- **Scope:** A, B, D, E, G, H this pass. **C deferred.**
- **Approach:** update `daily-habit-spec.md` → extend `finance.ts` **test-first** → wire UI →
  gate on `npm test` + `npm run build`.
- **Reverse afford (G):** lead with **max affordable price**, plus max EMI + "wait N months /
  earn ₹X more". Extends existing `monthsToAfford()`.
- **Bank presets (H):** SBI · HDFC · ICICI · Axis · Kotak, **editable indicative** rates with
  "edit to your rate" label (no claim of live rates).
- **Prepayment (H):** add **recurring-monthly-prepay** mode (new tenure + total interest saved)
  alongside existing lump-sum `prepaymentSavings`/`payoffPlan`.

## Forks RESOLVED (2026-09-24)
- **Login (was Fork 1):** **mandatory-to-save (soft wall).** App fully usable without an account;
  login required only when the user wants to **save daily earnings/savings**. → **backend required**
  (auth + data store). ⚠️ Reframes privacy story D: "browse offline free; sign in to save — saved
  data is encrypted." **DPDP/security now in-scope** (encryption-at-rest, minimal PII, consent note).
- **Interest type (was Fork 2):** **BOTH** — reducing-balance vs flat-rate (computation) AND
  fixed vs floating (rate behavior).
- **Q8 (free vs Pro):** free = fixed expenses, reverse-afford, privacy, tone;
  **Pro (₹99)** = prepayment v2, emergency-buffer deep view, cloud sync.
- **Q9 (placement):** fixed-expenses + emergency-buffer + reverse-afford → AffordCheck;
  prepayment v2 → EscapePlan; roast toggle + login → Me; privacy line → Me + first-run.
- **Higgsfield visuals:** asset pipeline + content hooks in-plan. User generates UIs in Higgsfield
  **web app** (paid plan, $0 extra — NOT the paid API), exports dropped into repo, model wires them
  with CSS/SVG fallback so build never breaks on a missing asset.

## Round 4 RESOLVED (2026-09-24) — user picked "all recs"
- **Q10 Backend/auth:** Supabase (Auth + Postgres, free tier, encrypt-at-rest).
- **Q11 Auth method:** Google OAuth + email magic link; phone OTP deferred.
- **Q12 Syncs:** settings + check-ins + streak + saved afford scenarios; local = offline cache, sync on login.
- **Q13 Floating rate:** simple scenario — new rate effective at month N, recompute; fixed = constant.
- **Q14 Higgsfield:** drop-zone `public/higgsfield/` + naming; slots Today hero / AffordCheck bg /
  EscapePlan header / ShareCard bg; WebP/PNG (+MP4/WebM); always CSS/SVG fallback.

Full v3 spec written to `daily-habit-spec.md` (§ "v3 Feedback Pass Spec").

# 🛠️ v3 build log

## Step 1 — finance engine additions ✅ (2026-09-24)
- `src/lib/finance.ts` + new pure functions, all tested:
  - A: `disposableIncome`, `affordVerdictWithExpenses` (disposable-income bands 30%/50%).
  - G: `principalFromEmi`, `maxAffordableEmi`, `maxAffordablePrice` (reverse "what can I afford now").
  - B: `emergencyRunwayMonths`, `bufferVerdict` (job-loss runway; ≥6 go / ≥3 warn / <3 danger).
  - H: `recurringPrepaymentSavings` (tenure + interest saved), `flatEmi` + `interestByMethod`
    (flat vs reducing), `floatingRatePayoff` (rate change at month N).
- `src/lib/finance.test.ts`: +25 tests incl. Anmol's ₹95k/₹12k/₹70k → danger case.
- **Gate: `npm test` = 64 green (51 finance + 13 daily); `npm run build` clean.** ✅

## Step 2 — bank presets ✅
- `src/data/banks.ts`: `BANK_PRESETS` (SBI/HDFC/ICICI/Axis/Kotak, editable indicative home + personal
  rates) + `BANK_RATE_DISCLAIMER`. Not yet wired into UI.

## Remaining (v3 build order, steps 3–8)
3. AffordCheck: fixed-expenses + liquid-savings inputs → `affordVerdictWithExpenses`, reverse-afford
   result on danger, emergency-buffer readout, tone-aware roast.
4. EscapePlan (Pro): prepayment v2 panel (recurring, flat/reducing toggle, floating scenario, bank chips).
5. Me: roast-tone toggle + privacy line + export/delete data.
6. Higgsfield `asset()` helper + slots (fallbacks first; art dropped in later).
7. Supabase auth + sync (mandatory-to-save), Pro-gated cloud sync — **last**, so calc isn't blocked.
8. Final gate: `npm test` green + `npm run build` clean.

## Stickiness scaffolding — added + VERIFIED ✅ (2026-09-24)
Art-independent retention layer so Higgsfield visuals drop in later with zero code change.
**Gate passed: `npm run build` clean (`tsc -b` no type errors, 426 modules) + `npm test` = 64 green.**
The two earlier risk flags both resolved fine (Tailwind `bg-danger/10`/`border-danger`/`text-danger`
generate from the token; `import.meta.glob` compiles and globs the art-less folder to `{}` cleanly).

Files touched:
- **NEW `src/lib/assets.ts`** — `asset(slot)` / `hasAsset(slot)`. Vite-globs `src/assets/higgsfield/*`
  ({webp,png,jpg,jpeg,avif,mp4,webm}); a missing slot returns `null` → component uses its CSS/SVG
  fallback. Missing file never breaks build / never shows a broken image.
- **NEW `src/assets/higgsfield/README.md`** — drop-zone + slot naming table (art goes here, no code change).
- **`src/index.css`** — added "Catchy retention signals": `.pulse-cta` (attention pulse for the daily
  CTA), `.chip-live` (heartbeat dot), `.glow-go/.glow-warn/.glow-danger/.glow-pop` (verdict glows),
  `.shimmer` (celebration sweep), all `prefers-reduced-motion`-guarded.
- **`src/screens/Today.tsx`** — imports `asset`; hero now shows `asset('today-hero')` with an ink
  scrim when present, halftone fallback when not; "Checked in" card gets `.glow-go`; when not checked
  in: a `.pulse-cta`-wrapped daily CTA + an at-risk "Streak at risk — check in before midnight" banner
  with `.chip-live`.

Not yet done (same pattern, other screens): apply `asset()` + signals to AffordCheck (`afford-bg`),
EscapePlan (`escape-header`), ShareCard (`share-bg`), ResultCard (`verdict-*` + glow classes).

---

# ▶ TOMORROW'S JOB — Higgsfield front-end redesign (2026-09-25)

**Goal:** overhaul the *whole* front end into something so aesthetic and sticky the user never
wants to leave. Visuals generated in the **Higgsfield web app** (paid plan — $0 extra, NOT the paid
API), exported into the repo, wired in with fallbacks. **Design/motion only — do NOT touch the
finance engine, tests, or data logic (v3 is locked and 64 tests green).**

## What "never leaves it" means (design principles to apply)
1. **First-paint delight** — Today screen must feel alive in <1s: hero art + the streak flame +
   the allowance ring animating on load. This is the daily dopamine hit.
2. **One obvious action** — the daily Money Check-in is the hero CTA, always one tap away; never bury it.
3. **Motion with meaning** — springy Framer Motion on verdict reveal, streak increment, ring burn-down,
   page transitions. Celebrate wins (confetti on 🟢 / streak milestone), soften losses (shake + a roast, streak survives).
4. **Emotional verdicts** — 🟢/🟡/🔴 each get their own art + copy personality (tone toggle: honest default / Brutal mode).
5. **Depth & finish** — CRED-style spacing, layered shadows, glass/press states; keep the tabloid-brutalist
   bones (oversized Archivo wordmark, hot-red accent, halftone, sticker tags, black ticker).
6. **No dead ends** — every empty/loading/error state is designed and on-brand (first-run, no debts, offline, synced).
7. **Reward streaks** — visible streak history, milestone badges, "don't break the chain" tension.

## Brand identity to stay inside (already in `src/index.css`)
Tabloid-brutalist + CRED finish. Palette tokens: paper/ink/go/warn/danger/pop/card, 14px radius,
hard 6px shadows, **Archivo** (single family, weight for hierarchy). Utility classes exist:
`.tag .halftone .stripes .watermark .lift .marquee .highlight`. Keep dark/light both working;
respect `prefers-reduced-motion`.

## Higgsfield assets to generate (drop into `public/higgsfield/`)
Generate at ~2× for retina, export **WebP** (or PNG), keep each **< 250 KB** (compress — this is a PWA).
Use one consistent art direction across all of them so the app reads as one system.

| File | Where it's used | Target size | Direction (prompt seed) |
|------|-----------------|-------------|--------------------------|
| `today-hero.webp` | Today screen hero backdrop | 1080×720 | Bold editorial money-anxiety-turned-confidence; hot-red + ink, halftone texture, generous negative space at top for the wordmark; NOT busy behind text |
| `afford-bg.webp` | AffordCheck subtle full-bg | 1080×1920 | Very subtle paper/ink texture, low contrast, must sit behind form inputs and a verdict card |
| `escape-header.webp` | EscapePlan (Pro) header band | 1080×600 | Aspirational "debt-free / escape" energy, premium, matches Pro feel |
| `share-bg.webp` | ShareCard export bg (fixed 1080×1350) | 1080×1350 | On-brand share/flex background; leave a clear central safe-zone for the verdict + numbers |
| `verdict-go / warn / danger.webp` (opt.) | ResultCard per verdict | 800×800 | Three moods: green triumph / amber caution / red "you mad bro" — playful, roast-friendly |
| `icon-512.png`, `maskable-512.png` (opt.) | PWA install icon upgrade | 512×512 | Refined "Broke?" mark; replaces the current SVG-only icon |

## Wiring contract (so tomorrow's build is mechanical)
- Add `src/lib/assets.ts` → `asset(name): string | null` that returns the `public/higgsfield/<name>`
  URL **only if present**, else `null` → components render the existing CSS/SVG treatment. **A missing
  file must never break the build or leave a broken image.** (Vite: reference via `/higgsfield/...`
  or `import.meta.glob` with `{ eager, query: '?url' }` and a try/catch.)
- Every `<img>`/background gets alt text + a paired caption/copy line (content hook per slot).
- Keep gzipped JS/CSS roughly where it is; images are the main new weight — lazy-load below-the-fold.

## Screen-by-screen redesign checklist
- **Today** (default, the retention engine): cinematic hero, animated streak flame + allowance ring,
  giant one-tap check-in CTA, roast line when over budget, quick tiles → Afford/Debt. Make THIS the wow screen.
- **AffordCheck:** hero input → verdict reveal with motion; on 🔴 show the reverse-afford "you can do ₹X today";
  emergency-buffer readout; tone-aware copy.
- **EscapePlan (Pro):** premium header art, prepayment v2 panel visuals, bank chips.
- **Me:** streak history + milestones, tone toggle, privacy line, sign-in-to-save, export/delete.
- **Global:** bottom nav polish, page transitions, empty/loading/error states, dark/light pass.

## How to resume tomorrow
1. Open Claude Code in `C:\Users\tabhi\Downloads\broke app`.
2. Say: *"Resume from progress.md → TOMORROW'S JOB. I've dropped my Higgsfield exports in
   `public/higgsfield/`. Build the `asset()` helper and redesign the front end per the checklist —
   design/motion only, keep the finance engine and 64 tests untouched."*
3. If assets aren't ready yet, the session can still build the `asset()` helper + all layout/motion
   with fallbacks, then the art slots in later with zero code changes.
4. Gate before "done": `npm test` still 64 green + `npm run build` clean, then `npm run dev` and eyeball
   Today → AffordCheck (🔴 reverse-afford) → EscapePlan → Me on a phone width.

## Guardrails (do not cross)
- No changes to `finance.ts` / `daily.ts` / their tests / data model.
- Steps 3–7 of the v3 build (calc UI + Supabase auth) are **separate** work — the redesign can land
  first, but must leave room for the v3 features (expense inputs, reverse-afford, prepayment v2, login).
- Don't claim done without the test + build gate passing.

---

# ✅ SESSION 2026-09-24 (cont.) — Higgsfield wiring + v3 calc UI (steps 3–6)

**Gate passed: `npm run build` clean + `npm test` = 64 green.** Finance engine / daily / their
tests untouched (guardrail held). Higgsfield stays the web-app asset pipeline (NOT the paid API),
confirmed by user ("I have a Higgsfield account").

## Higgsfield integration — now wired on EVERY screen (fallbacks intact)
- `asset()` slots live in: **Today** (`today-hero`, pre-existing), **AffordCheck** (`afford-bg`
  full-screen wash @6% opacity), **EscapePlan** (`escape-header` premium band), **ResultCard**
  (`verdict-go/warn/danger` textures + verdict glow), **ShareCard** (`share-bg`, kept solid base
  so PNG export is safe if art missing). A missing file → CSS/SVG fallback, never a broken build.
- **NEW `src/assets/higgsfield/BRIEF.md`** — copy-paste Higgsfield prompts + exact filenames/sizes
  + a locked house-style paragraph. This is the user's to-do: generate in the Higgsfield web app,
  drop exports in `src/assets/higgsfield/`, rebuild. No code change needed.

## v3 calc UI shipped (steps 3–6)
- **Step 3 — AffordCheck** (rewritten): added **fixed monthly expenses** + **liquid savings**
  inputs; verdict now uses `affordVerdictWithExpenses` (disposable-income bands, not just EMIs);
  live "free to commit / month" readout; on 🔴 a **reverse-afford** card (`maxAffordablePrice` →
  max price + safe EMI + "earn ₹X/mo more" + "save up in N"); **emergency runway** card
  (`emergencyRunwayMonths`/`bufferVerdict`, 6-month target bar). Tone-aware roast throughout.
- **Step 4 — EscapePlan** (rewritten): **Prepayment lab** — editable rate with **5 bank preset
  chips** (`BANK_PRESETS`) + disclaimer, **lump vs recurring** modes (`prepaymentSavings` /
  `recurringPrepaymentSavings` incl. new tenure); **reducing-vs-flat** card (`interestByMethod`,
  flags the hidden flat cost); **floating-rate what-if** (`floatingRatePayoff`, fixed vs floated
  interest + new EMI). Kept payoff optimizer + roadmap; trimmed shipped items from "coming soon".
- **Step 5 — Me**: **roast-tone toggle** (Honest/Brutal → `settings.roastTone`), **privacy card**
  ("data stays on your phone" — the untold localStorage story) + **Export my data (JSON)**, and
  Reset now uses `deleteAllData()`.
- **Step 6 — asset() helper**: already existed; now consumed everywhere (see above).

## New / changed files
- NEW: `src/lib/tone.ts` (honest/brutal roast copy), `src/assets/higgsfield/BRIEF.md`.
- `src/lib/storage.ts`: `Settings.roastTone`; `Profile.fixedExpenses` + `.liquidSavings`
  (additive, defaulted, backward-compatible); `setSettings` now merges a partial;
  `exportAllData()` + `deleteAllData()`.
- Rewrote: `AffordCheck.tsx`, `EscapePlan.tsx`. Edited: `Me.tsx`, `ResultCard.tsx`,
  `ShareCard.tsx`. (Today.tsx untouched — already wired.)

## ⏭️ Still open (next session)
- **Step 7 — Supabase auth + cloud sync** (mandatory-to-save, Pro-gated): NOT started — needs the
  user's Supabase project URL + anon key + a decision on the auth UI. Everything else is done so
  this no longer blocks anything.
- **Visual eyeball pending user** + drop in the actual Higgsfield exports per `BRIEF.md`.
- Deferred (unchanged): Razorpay/UPI, real affiliates, git commit, Vercel deploy, future-income (C).

---

# ✅ SESSION 2026-09-24 (cont.) — Higgsfield art dropped in + wired

Art direction pivoted (user): flat/newsprint → **premium 3D "reward-screen" renders** (glossy
coins/gems/rings/flames, CRED × mobile-game). `BRIEF.md` fully rewritten with 3D prompts + a
negative-prompt/anti-hallucination guide. **Build clean + 64 tests green.**

## Assets wired (6 of 7 slots now real WebP renders, all <250 KB, ~287 KB total)
User generated in the Higgsfield web app; I mapped/compressed with ffmpeg → slot-named WebP:
- `today-hero` (card + flame-ring + ₹ coins), `afford-bg` (falling ₹ coins),
  `verdict-go` (gold trophy), `verdict-warn` (amber gem), `verdict-danger` (red gem in wallet),
  `escape-header` (violet staircase).
- **`share-bg` still SVG** — the trophy render has "$ AWESOME" text on the ring (wrong currency),
  held back. User to run the text-removal edit → save as `share-bg.webp`, or approve as-is.
- Source PNGs + a `.spz` (3D splat, unusable) + blank app screenshots archived in
  `src/assets/higgsfield/_raw/` (kept, excluded from the `import.meta.glob`).

## Code changes
- `assets.ts`: glob now includes `svg`; **raster wins over the SVG stand-ins** for the same slot;
  new `isRealRender(slot)` so components switch treatment.
- Real-render treatments: **ResultCard** shows a framed hero image (object-contain on ink) for
  real verdict renders (texture overlay kept for SVG); **EscapePlan** header render at full opacity
  + diagonal ink scrim; **Today** hero render at 70% + gradient scrim; **AffordCheck** bg at 12%.
- **Today** hero now leads with a big "Broke?" wordmark (real app text — brand/numbers are HTML,
  never baked into AI art, which garbles text).

## Next
- Supabase (step 7) still the remaining v3 item.
- `share-bg` once text-cleaned. Optional: premium app-skin polish pass to match the renders.

---
---

# ★★★ HANDOFF — CURRENT STATE & TOMORROW'S JOB (2026-09-24, end of day) ★★★

**Read this first.** This is the definitive current state. Everything below supersedes older
sections. **Gate is green: `npm test` = 64 passed, `npm run build` clean.**

## ✅ SHIPPED
- **Live on Vercel:** https://broke-app-five.vercel.app/ (200, auto-deploys on push to `main`).
- **GitHub:** https://github.com/Abhiitiwariii/broke-app (public). `main` is the deploy branch.
  `.gitignore` excludes `node_modules`, `dist`, `.vercel`, `*.tsbuildinfo`, and
  `src/assets/higgsfield/_raw/` (57 MB of source renders — the compressed `.webp` slots ARE committed).
- **Demo videos** (in `C:\Users\tabhi\Downloads\`, NOT in the repo): `broke-demo.mp4` (46s raw
  walkthrough) and `broke-demo-final.mp4` (52s, with branded title + end card). Built entirely with
  ffmpeg from a headless-Chrome/puppeteer capture (`_demo_capture.mjs`, deleted after each run).

## ✅ FULL DARK PREMIUM REDESIGN (done this session)
- **Dark-first theme** — `src/index.css` rewritten: `--color-bg/surface/card/elev/paper/ink/line`,
  vignette, soft glows (no hard shadows), `.card`, `.scrim-b`, glow/pulse/shimmer utilities.
- **Images featured in front** (user's key ask): Today = full-bleed cinematic card render hero;
  verdict result = gem/trophy shown HUGE (framed hero, `ResultCard`); EscapePlan = full staircase
  header; onboarding = cinematic hero. `isRealRender()` in `assets.ts` switches real renders →
  framed-hero vs SVG stand-ins → texture.
- **Pro fully removed** — no paywall, no PRO badge, no locks; everything free. `proContext.tsx`
  forces `isProUnlocked: true` and no-op paywall (seam kept for later pricing). `PaywallSheet.tsx`
  and `ProLock.tsx` are now **orphaned/unused** (safe to delete).
- **lucide-react icons** everywhere (nav, tiles, buttons, section titles, check-in, Me). Kept the
  🔥 emoji only for the streak flame.
- **First-run onboarding** — `src/components/Onboarding.tsx` (income → fixed costs → "₹X/day"
  reveal), shown by `App.tsx` when `getProfile().netMonthlyIncome <= 0`.
- **Weekly trends** — inline SVG 7-day spend-vs-budget bars on `Me`.
- **Micro-interactions** — `src/lib/ui.tsx` (`haptic()`, `useCountUp()`), springy verdict-gem
  reveal, animated ring/score/streak, confetti/shake. Reduced-motion respected.
- **PWA kept.**

## Higgsfield art (6 of 7 slots are real WebP renders, <250 KB each)
`today-hero` (card+flame), `afford-bg` (coins), `verdict-go` (trophy), `verdict-warn` (amber gem),
`verdict-danger` (red gem+wallet), `escape-header` (violet staircase). **`share-bg` still SVG** —
the trophy render has "$ AWESOME" garbled text; user to run the text-removal edit → drop
`share-bg.webp`. Generation brief + prompts: `src/assets/higgsfield/BRIEF.md`.

## Screen/file map (all dark, all converted)
`App.tsx` (onboarding gate + router), `components/AppShell.tsx` (glass nav, lucide),
`screens/Today.tsx`, `AffordCheck.tsx`, `DebtHealth.tsx`, `EscapePlan.tsx`, `Me.tsx`,
`components/ResultCard.tsx`, `Onboarding.tsx`, `CheckInSheet.tsx`, `BrutalCard/Button.tsx`,
`NumberField.tsx`, `ScoreDial.tsx`, `DailyWidgets.tsx`, `VerdictBadge.tsx`.
`lib/`: `finance.ts` (+tests, 64), `daily.ts` (+tests), `storage.ts`, `tone.ts`, `ui.tsx`,
`assets.ts`, `proContext.tsx`, `router.tsx`, `format.ts`, `share.ts`, `pro.ts` (seam).

## Run commands (folder name has a space — keep quotes)
```powershell
cd "C:\Users\tabhi\Downloads\broke app"
npm run dev      # http://localhost:5173
npm test         # 64 green (finance + daily)
npm run build    # tsc -b && vite build
git push         # auto-deploys to Vercel
```

---

# ▶ TOMORROW'S JOB — SUPABASE INTEGRATION (v3 step 7, the last v3 item)

**Goal:** Google sign-in + cloud sync so a user's money data persists across devices.

### ⚑ REVISED FLOW (user update, 2026-09-24 eve) — this OVERRIDES the older "optional login" model
The app now **gates on login after onboarding** (Google is required to continue — no anonymous use).
Exact sequence:
1. **Onboarding questions FIRST (no login yet)** — collect:
   - **Salary (post-tax / take-home)** — required.
   - **Savings target** — a **toggle: percentage (%) OR ₹ amount**. User picks either; store the mode.
   - Keep **fixed monthly expenses** (needed for the afford math + daily allowance) — one more field.
   - Then the "you can spend ₹X/day" reveal (already built).
2. **Login wall** — a screen: "Sign in with Google to save your plan & continue." User **must**
   `signInWithOAuth({ provider: 'google' })` to proceed into the app.
3. **On successful sign-in** — write the onboarding answers to Supabase (and local cache), then enter
   the app on Today.
- **Tradeoff to be aware of:** every user must have a Google account; there is no offline/anonymous
  path anymore. (If we later want a "try without account" mode, it's a small change — the seam stays.)
- **Dev fallback:** if Supabase env vars are missing (local dev without keys), don't hard-crash —
  show the login screen but allow a "skip (dev only)" that proceeds locally, so the app is still
  buildable/runnable without keys. Never ship that skip to prod.

### Savings %-or-amount detail (keep finance/daily untouched)
`dailyAllowance()` in `daily.ts` already takes `savingsGoalPct` and is TESTED — **do not change it.**
Instead convert at the input layer: if the user chose an amount, compute
`savingsGoalPct = round(savingsAmount / salary * 100)` before calling `dailyAllowance`. Store both
`savingsMode: 'percent' | 'amount'` and the raw value in `settings` (additive, backward-compatible,
like we did for `roastTone`). UI shows whichever the user picked; math always uses the derived pct.

localStorage stays the on-device cache; on login we pull + merge and push on change.

## Locked decisions (from the v3 grilling, already in this file above)
- **Backend:** Supabase (Auth + Postgres, free tier; Postgres is encrypted at rest).
- **Auth methods:** Google OAuth + email magic link. Phone OTP deferred.
- **What syncs:** `settings`, `checkins`, `streak`, and saved **afford scenarios** (history).
  Local = offline cache; sync on login; last-write-wins per key is fine for v1.
- **Privacy reframe (DPDP):** "Browse offline, free. Sign in to save — your saved data is encrypted,
  we store minimal PII, and you can export/delete any time." Update the Me privacy card copy.

## Build order (test-first where it makes sense; keep finance/daily/tests untouched)
1. **Supabase project** → copy Project URL + anon key. Add to `.env.local`:
   `VITE_SUPABASE_URL=...`, `VITE_SUPABASE_ANON_KEY=...`. Also add both to **Vercel → Project →
   Settings → Environment Variables** (Production + Preview), then redeploy.
2. `npm i @supabase/supabase-js`.
3. **`src/lib/supabase.ts`** — create client from `import.meta.env`. **Guard missing env → export
   `null`** so the app still builds/runs offline when keys aren't set. `export const supabase =
   (url && key) ? createClient(url, key) : null`.
4. **DB schema** (SQL in Supabase editor): table `profiles_data (user_id uuid pk references
   auth.users, data jsonb, updated_at timestamptz default now())`. One JSON blob per user holding
   `{ profile, settings, streak, checkins, history }`. **Enable RLS**; policies: `user_id =
   auth.uid()` for select/insert/update. (Simple v1; can normalize into tables later.)
5. **Auth + the login gate (see REVISED FLOW above)** — enable the **Google** provider in Supabase
   (needs a Google Cloud OAuth client id/secret + the redirect URL:
   `https://broke-app-five.vercel.app` and `http://localhost:5173` for dev). Rework
   `src/components/Onboarding.tsx`: keep steps 1–2 (now with the salary + savings %/₹ toggle + fixed
   expenses), then add a **step 3 = login wall** with a "Continue with Google" button
   (`supabase.auth.signInWithOAuth({ provider:'google' })`). `App.tsx` gate becomes: show app only
   when there's a Supabase session; otherwise show Onboarding→login. Handle the OAuth redirect on
   load (`supabase.auth.getSession()` / `onAuthStateChange`). Email magic link is optional/secondary.
6. **Sync layer — `src/lib/sync.ts`:**
   - `pullRemote()` on auth state change (login) → fetch row → **merge into local** (prefer the
     newer `updated_at`; for v1, remote overwrites local on first login, then local is source).
   - `pushRemote()` debounced (~1.5s) after any storage write when authed → upsert the JSON blob.
   - Wrap the existing `storage.ts` setters (or subscribe to a change event) so writes trigger a push.
   - Everything must no-op gracefully when `supabase == null` or signed out.
7. **Wire into `Me`:** auth status (signed-in Google email + avatar, **Sign out**), a "Synced ✓"
   chip, and updated privacy copy — since login is now required, say "Signed in with Google · your
   data is encrypted at rest · minimal PII · export or delete any time" (drop the "runs fully offline,
   no account" line). Keep Export/Delete; **Delete must also delete the cloud row** and sign out.
8. **Gate:** `npm test` still 64 green (finance/daily untouched), `npm run build` clean, then
   manually test: sign in with Google → data uploads → clear localStorage → reload → sign in →
   data comes back. Then `git push` (Vercel env vars must be set or the build's client is null =
   offline, which is fine).

## Guardrails (do not cross)
- **Login is now required after onboarding** (per REVISED FLOW) — but the build must not hard-crash
  when Supabase env vars are missing: show the login screen with a dev-only "skip" that proceeds on
  local cache (never enabled in prod). Signed-in = source of truth; localStorage = cache.
- **No changes** to `finance.ts` / `daily.ts` / their tests / the finance data model. (Savings as a
  ₹ amount is converted to a % at the input layer — never edit `dailyAllowance`.)
- **Secrets:** only the anon key goes in client env (safe by design + RLS). Never commit `.env.local`
  (already covered by `*.local` in `.gitignore`).
- Don't claim done without the test + build gate passing and a real sign-in round-trip verified.

## Also still open (smaller, after Supabase or in parallel)
- `share-bg.webp` (text-cleaned trophy render).
- Delete orphaned `PaywallSheet.tsx` / `ProLock.tsx`.
- Optional: `vercel.json` (SPA rewrite + long-cache headers for `/assets`).
- Optional polish: wire `useCountUp` into the big numbers; captions/alt cuts of the demo video.
- Deferred (unchanged): Razorpay/UPI, real affiliate partners, future-income growth (feedback item C).

## How to resume tomorrow
Open Claude Code in `C:\Users\tabhi\Downloads\broke app` and say:
*"Resume from progress.md → TOMORROW'S JOB. Build the Supabase integration (offline-first,
mandatory-to-save soft wall). Here are my Supabase URL + anon key: <paste>."*
(Or set them yourself in `.env.local` + Vercel first and just say "Supabase keys are set, build it.")

---
---

# ★ NEON-LUXE REDESIGN + HIGGSFIELD MCP (2026-09-26)

## Design system overhaul — SHIPPED (build clean, 64 tests green)
Direction (locked via grilling): **neon-hyped × CRED-grade polish — sharp, never dull, distinctive.**
- **`src/index.css` rebuilt:** refined near-black palette (`--color-bg #08080c`, real surface/elev grays),
  **signature red→violet gradient** (`--color-brand1/2`, `.grad-text`, `.brand-fill`, `.glow-brand`),
  aurora hero backdrop (`.hero-mesh` + `.grain`), neon verdict glows, `.card` finish (gradient +
  inner top-highlight + depth), gradient range sliders, animated wordmark (`.grad-anim`).
- **Space Grotesk numeric font** (`--font-num`, `.num`) on all big numbers (ring, score, money, stats).
  Added to `index.html` Google Fonts.
- **Primary CTA = the gradient neon button** (`BrutalButton` variant `ink`/`pop` → `brand-fill glow-brand`).
- **Today hero redesigned** — dropped the messy full-bleed render; now a designed **aurora + gradient
  wordmark + allowance ring** as the stars (fixes the "background not neat" complaint). AI renders are
  reserved for reward moments (verdict gems, escape header).
- All screens inherit the polish via the shared `.card` / `.num` / button classes. Verified on Today,
  AffordCheck, DebtHealth (49/100 amber-glow dial), EscapePlan (gradient toggles/slider, grotesk ₹).

## Higgsfield MCP — CONNECTED (2026-09-26)
- Registered in Claude Code **user config** (`~/.claude.json`): server `higgsfield` →
  `https://mcp.higgsfield.ai/mcp` (Streamable HTTP). **No API key** — OAuth via Higgsfield account,
  uses plan **credits**. 30+ models (Soul, Seedream, Flux, Kling, Veo…).
- **To activate:** user runs `/mcp` → higgsfield → Authenticate (browser), then **restarts Claude
  Code** (MCP loads at startup — not available in the session where it was added).

## ▶ NEXT (once MCP is authed + Claude Code restarted): regenerate ALL visuals in the neon style
Use the Higgsfield MCP directly (no more manual web-app export/drop) to regenerate the 6 slot assets
so they match the neon-luxe look, then wire them in. **Neon art direction (base prompt):**
> Ultra-premium 3D product render on pure black, neon-luxe fintech: glossy objects lit by a red→violet
> gradient glow (hot-pink #ff3b6b → electric violet #8b5cff), rim light, volumetric haze, subtle bloom,
> gold ₹ rupee coins, cinematic depth of field, 8k octane render, sharp edges. Single hero object,
> lots of empty black space. No text, letters, numbers, or logos.
Per-slot subjects unchanged (today-hero card+flame ring / verdict gems / trophy / staircase / coins),
but recolour to the red→violet neon palette. Then: compress to webp <250 KB, drop as slot names
(`assets.ts` picks raster over the SVG stand-ins), retune overlay opacity per screen, gate + push.

Also still open: Supabase (login-gated onboarding — see section above), `share-bg`, delete orphaned
`PaywallSheet.tsx`/`ProLock.tsx`, optional `vercel.json`.

---

## ⏸ SAVE POINT (2026-09-26, end of session)

**Where things stand right now:**
- **Live app:** https://broke-app-five.vercel.app/ — still shows the *previous* dark UI. The
  **neon-luxe redesign is committed locally (`9105769`) but NOT pushed yet.** Run `git push` to
  deploy the neon look (auto-deploys via Vercel).
- **Git:** on `main`. Latest local commits: `9105769` (neon redesign + MCP log), `7f3547f`
  (revised onboarding/auth plan), `0986ead` (handoff), `b4b5a40` (initial). `origin` has up to
  `b4b5a40` — **`git push` needed to sync the rest.**
- **Demo videos** in `C:\Users\tabhi\Downloads\`: `broke-demo.mp4`, `broke-demo-final.mp4`
  (titled, with the Vercel URL). Not in the repo.
- **Higgsfield MCP:** added to `~/.claude.json` (user scope) as `higgsfield` →
  `https://mcp.higgsfield.ai/mcp`. Status = **Needs authentication**. It does NOT show in `/mcp`
  yet because it was added mid-session.

**Two pending USER actions (do these next):**
1. **Deploy the redesign:** `cd "C:\Users\tabhi\Downloads\broke app"` → `git push`.
2. **Activate Higgsfield MCP:** fully **restart Claude Code** (`/quit` then relaunch) → `/mcp` →
   higgsfield → **Authenticate** (browser). Then it's usable by the agent.

**Then (next session):** *"Higgsfield's authed — regenerate the 6 hero assets in the neon red→violet
style and polish the visuals."* (neon prompt is in the section above). After that, the big remaining
build is **Supabase** (login-gated onboarding — full plan in the TOMORROW'S JOB section).
