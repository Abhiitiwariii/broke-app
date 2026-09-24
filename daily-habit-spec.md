# Broke? — Daily-Habit v2 Build Spec

> Outcome of a grilling session (2026-09-22). Turns Broke? from an occasional
> calculator into a daily ritual. This spec is additive to `plan.md` — the
> finance engine, tokens, and Pro seam all stay. Source of truth for v2 work.

## Decisions locked
1. **Goal:** real launch-candidate, ruthlessly tight MVP. One genuine retention
   loop, no backend yet (data stays in localStorage, model kept push-ready).
2. **Audience + trigger:** first-job earners **22–27** (income, first EMIs/credit
   card, real money anxiety). Trigger = impulse-buy hesitation + a daily spend pulse.
3. **Aesthetic:** keep a toned-down **brutalist** personality as the brand, borrow
   **Duolingo's retention loop** (streak, one daily action, forgiving) and **CRED's
   finish** (spacing, depth, motion). Not a wholesale copy of any one app.
4. **Daily action:** a one-tap **Money Check-in** (spent / saved / resisted a
   temptation) that feeds a **daily-allowance burn-down** and a **streak**. Afford-check
   + Debt-health become occasional "deep tools."
5. **Re-engagement:** MVP has **no push** — drive habit with streak-loss anxiety, a
   daily card that resets, home-screen install. Model kept push-ready (WhatsApp/push later).
6. **Paywall:** never gate the daily check-in. Pro (₹99/mo) = **Escape Plan** (anchor)
   + perks: **streak freeze**, **spend trends/history**, **custom challenges**.
7. **Navigation:** 4-tab bottom nav — **Today** / **Afford** / **Debt** / **Me**.
   "Today" is the dashboard they open every morning; Escape Plan hangs off Debt.
8. **Streak + allowance rules:** streak counts **showing up** (checked in today), not
   success — an over-budget day earns a roast, not a broken streak. Daily allowance =
   `(netIncome − EMIs − savingsGoal) ÷ daysInMonth`, savings goal default **20%** (editable).

## Data model (localStorage, additive)
- `broke.settings` → `{ savingsGoalPct: number /*=20*/ }`
- `broke.streak` → `{ current, longest, lastCheckIn: 'YYYY-MM-DD'|null, freezes }`
- `broke.checkins` → `Array<{ date:'YYYY-MM-DD', spent:number, kind:'spent'|'saved'|'resisted', note?:string }>` (keep last ~60)
- Existing keys unchanged: `broke.profile`, `broke.debts`, `broke.isPro`, `broke.history`.

## New pure logic — `src/lib/daily.ts` (unit-tested)
- `todayKey(d?): 'YYYY-MM-DD'`, `daysInMonth(d): number`
- `dailyAllowance(netIncome, emis, savingsGoalPct, d?): number` (≥0 guard)
- `spentOn(checkins, dateKey): number` (sum of that day's spends)
- `applyCheckIn(streak, dateKey): Streak` — same-day = no-op; yesterday = +1;
  gap>1 = reset to 1 (freeze consumes one gap day if available). Tracks `longest`.
- `streakState(streak, todayKey): { checkedInToday: boolean, atRisk: boolean }`

## Components (`src/components/`)
- `AllowanceRing` — SVG burn-down ring: spent vs daily allowance; green→amber→red as it depletes.
- `StreakFlame` — flame + count, dimmed when not checked in today.
- `CheckInSheet` — bottom sheet (reuse PaywallSheet pattern): amount spent + kind
  (spent/saved/resisted) + optional note → writes check-in, advances streak, roast on over-budget.

## Screens (`src/screens/`)
- `Today` (new default) — hero: `StreakFlame` + `AllowanceRing`; today's check-in CTA
  (or "✓ Checked in" + edit); a roast line when over allowance; quick tiles → Afford / Debt.
- `Me` (new) — streak (current/longest), savings-goal control, Pro status/unlock,
  install-to-home-screen hint, reset data. Pro perks (trends/freeze) shown, gated by `ProLock`.
- `Afford`, `Debt`, `Escape` — unchanged in logic; inherit the refreshed nav/shell.
- `Home` retired (its pillars fold into Today's tiles).

## Router / shell
- `Route` becomes `'today' | 'afford' | 'debt' | 'escape' | 'me'`; default `'today'`.
- `AppShell` bottom nav → 4 tabs (Today / Afford / Debt / Me); wordmark → `'today'`.

## Build order
1. `daily.ts` + Vitest tests (streak transitions, allowance, spentOn).
2. `storage.ts` additions (settings/streak/checkins get/set).
3. `AllowanceRing`, `StreakFlame`, `CheckInSheet`.
4. `Today` screen + wire check-in.
5. `Me` screen.
6. Router + `AppShell` nav + `App.tsx` (default Today, add Me).
7. Aesthetic polish pass (spacing/motion/depth) on Today + shell.
8. Gate: `npm run test` green + `npm run build` clean.

## Out of scope (v2 MVP)
Push notifications, backend/accounts, WhatsApp reminders, real payments, live affiliates,
spend auto-import. Pro "trends/freeze/challenges" ship as gated stubs, not full features.

---

# Broke? — v3 Feedback Pass Spec (2026-09-24)

> Outcome of the v3 grilling session (see `progress.md`). Additive to v2. Turns the
> afford-check from a yes/no into a real disposable-income engine, adds an emergency
> buffer, upgrades prepayment, and introduces mandatory-to-save login. Source of truth for v3.

## Decisions locked (from grilling)
- **Scope:** A fixed expenses · B emergency buffer · D privacy story · E roast tone ·
  G reverse affordability · H prepayment v2. **C (future income growth) deferred** to its own pass.
- **Approach:** finance engine changes are **pure + unit-tested first**, then UI. Gate on
  `npm test` + `npm run build`. Ship **calc features before auth** so the build isn't blocked on backend.
- **Login:** **mandatory-to-save (soft wall).** App usable offline without an account; login required
  only when the user chooses to save daily earnings/savings to the cloud. Backend = **Supabase**
  (Auth + Postgres, free tier, encrypt-at-rest). Auth = **Google OAuth + email magic link** (phone OTP deferred).
  DPDP-aware: minimal PII, consent note, data export/delete.
- **Sync scope:** settings (income/EMIs/fixed expenses/savings goal) + check-ins + streak + saved
  afford scenarios. localStorage stays the offline cache; syncs on login.
- **Interest type (H): BOTH** — reducing-balance vs flat-rate (computation) AND fixed vs floating (rate behaviour).
- **Bank presets (H):** SBI · HDFC · ICICI · Axis · Kotak, **editable indicative** rates, "edit to your rate" label.
- **Free vs Pro:** free = fixed expenses, reverse-afford, privacy, tone. **Pro (₹99)** = prepayment v2,
  emergency-buffer deep view, cloud sync.
- **Placement:** fixed-expenses + emergency-buffer + reverse-afford → **AffordCheck**; prepayment v2 →
  **EscapePlan**; roast toggle + login → **Me**; privacy line → Me + first-run.
- **Higgsfield visuals:** generated in Higgsfield **web app** (paid plan, $0 extra — NOT the paid API),
  exported into the repo; every slot has a CSS/SVG fallback so a missing asset never breaks the build.

## New pure logic — additions to `src/lib/finance.ts` (all unit-tested)
**A — fixed expenses / disposable income**
- `disposableIncome(netIncome, existingEmis, fixedExpenses)` → income − EMIs − fixed (may be negative).
- `affordVerdictWithExpenses(newEmi, netIncome, existingEmis, fixedExpenses)` → disposable-based bands:
  disposable ≤ 0 → danger; else newEmi/disposable <0.30 go / ≤0.50 warn / >0.50 danger.
  (Anmol's case ₹95k−₹12k−₹70k = ₹13k disposable → any real EMI is danger.)

**G — reverse affordability ("what CAN I afford now")**
- `principalFromEmi(emiAmount, annualRatePct, months)` → inverse of `emi()`.
- `maxAffordableEmi(netIncome, existingEmis, fixedExpenses, maxRatio=0.30)` → max(0, disposable×maxRatio).
- `maxAffordablePrice(netIncome, existingEmis, fixedExpenses, annualRatePct, months, {downPayment, maxRatio})`
  → `{ maxEmi, maxPrincipal, maxPrice }`. Pair with existing `monthsToAfford()` for the "wait N months" line.

**B — emergency buffer / job-loss**
- `emergencyRunwayMonths(liquidSavings, existingEmis, fixedExpenses)` → months of runway if income stops.
- `bufferVerdict(months)` → ≥6 go / ≥3 warn / <3 danger.

**H — prepayment v2**
- `recurringPrepaymentSavings(principal, annualRatePct, months, extraPerMonth)` → `{ interestSaved,
  monthsSaved, newTenureMonths }` (extra paid every month on top of EMI).
- `flatEmi(principal, annualRatePct, months)` and `interestByMethod(...)` → `{ reducing, flat }` totals
  (exposes how flat-rate quoting hides cost).
- `floatingRatePayoff(principal, annualRatePct, months, changeAtMonth, newRatePct)` → `{ totalInterest,
  finalEmi, monthsPaid }` (EMI recomputed on remaining balance/tenure at the new rate).

## New data — `src/data/banks.ts`
`BANK_PRESETS`: SBI/HDFC/ICICI/Axis/Kotak with indicative `homeLoanRate` + `personalLoanRate`, each
editable in the UI, shown with an "indicative — edit to your rate" disclaimer.

## UI / screen changes
- **AffordCheck:** add Fixed monthly expenses + Liquid savings inputs; verdict uses
  `affordVerdictWithExpenses`; on danger, show reverse-afford ("You can do ₹X today, or wait N months");
  emergency-buffer readout (`bufferVerdict`); roast copy honours the tone toggle.
- **EscapePlan (Pro):** prepayment v2 panel — lump-sum (existing) + recurring monthly prepay
  (tenure + interest saved); reducing/flat toggle; fixed/floating with rate-change scenario;
  bank-preset chips (editable).
- **Me:** roast-tone toggle (default honest+encouraging; "Brutal mode" on); Sign in to save (Supabase);
  privacy line ("Your data stays on this device unless you sign in to sync — then it's encrypted");
  export/delete data.
- **First-run:** one privacy line answering Mayank's D.

## Auth / backend (ships AFTER calc features)
- `src/lib/supabase.ts` client (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- `src/lib/auth.tsx` context (session, signIn Google/magic-link, signOut).
- Sync layer: on login, merge local cache ↔ `profiles`/`checkins`/`settings` rows (RLS: row owner only).
- Pro "cloud sync" gated by `ProLock`.

## Higgsfield asset pipeline
- Drop-zone `public/higgsfield/` + naming: `today-hero.webp`, `afford-bg.webp`, `escape-header.webp`,
  `share-bg.webp` (+ `.mp4`/`.webm` if video). Components read via a small `asset()` helper that
  falls back to the existing CSS/SVG treatment when the file is absent.
- Content hooks: alt text + a caption/copy line paired with each visual slot.

## Build order (v3)
1. **finance.ts additions + Vitest tests** ← this step; gate `npm test` green.
2. `src/data/banks.ts`.
3. AffordCheck: fixed expenses + reverse-afford + emergency buffer.
4. EscapePlan: prepayment v2 (recurring, flat/reducing, floating, bank chips).
5. Me: roast toggle + privacy line + export/delete.
6. Higgsfield asset helper + slots (fallbacks first, art dropped in later).
7. Supabase auth + sync (mandatory-to-save), Pro-gated cloud sync.
8. Gate: `npm test` green + `npm run build` clean.

## Deferred (v3)
Future-income-growth affordability (C), phone-OTP auth, WhatsApp/push, real payments/affiliates,
full Pro trends/freeze/challenges.
