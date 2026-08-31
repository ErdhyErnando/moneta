# Moneta Execution Tracking — Local Agent Handoff

> **Purpose:** Local tracking mirror for agent handoff across chat sessions.  
> **Source of Truth:** GitHub Issues (`gh issue list --state open`). This doc is a **cache + phase plan**, not the spec. If in doubt, read the issue body on GitHub (rewritten 2026-08-31 via grill-me).  
> **Last Updated:** 2026-08-31 by phase-5 session — PR #42 merged, #34/#35 closed by owner acceptance, branch cleaned up. Next: #34 v2 + visual rollout scoping (grill pending).  
> **Stack:** React 19 + TanStack Router + Hono + Drizzle + PostgreSQL + Better-Auth

## How to Use (for any new agent)

1. Run `gh issue list --state open --limit 50 --json number,title,body,labels,state` to get live truth.
2. Use this doc only for **phase ordering + grill decisions** that are not in issue bodies.
3. When you pick an issue, read its full body: `gh issue view <number> --json title,body`
4. After completing, close issue via `gh issue close <number>` and update this doc's checklist.

## Grill Decisions Log (2026-08-31)

Locked via `ask_user_question` + `grill-me`:

- **Project Phase:** `Tech-debt + security first` — security/perf/refactor (#23, #24, #25-27, #29) before new features. Justified: reduces risk for #32-35.
- **#22 Mismatch (updated 08-31, phase 4):** Root cause found during #32 smoke: forms sent *local midnight*, serialized as a shifted UTC instant (Jul 1 in UTC+2 → Jun 30 22:00Z), so UTC bucketing (accordion, dashboard `DATE_TRUNC`) and local-range breakdown disagreed on month-boundary rows. **Canonical now: calendar dates stored at UTC midnight** — client sends `toUtcDayIso(pickedDate)` at all write sites, server schemas round incoming instants to the nearest UTC day (`date-utils.ts`), range filters travel as date-only `YYYY-MM-DD` strings (normalized to UTC boundaries server-side), display uses `asUtcDay()`, and migration `0005_utc_calendar_days` normalizes legacy rows (Europe/Amsterdam tz — owner's).
- **#32 + #33:** Two pages, not one. `#32` = monthly accordion on `/expense` + `/income` (grouped by UTC month). `#33` = new `/mutations` flat combined ledger (income+expense chronologically).
- **#35 Redesign:** Login-only (shadcn `login-03/04` split-panel + kumo-ui tokens). No full-app redesign in v1.
- **#34 Asset Tracking:** MVP first, live later. v1 = manual holdings ledger (type/amount/date). No live prices. v2 will add CoinGecko (crypto, 10k/mo free) + Alpha Vantage/Finnhub (stocks) with caching.
- **#31 Dashboard Add:** Quick-add Dialog (type toggle Expense/Income) on dashboard, not navigation.
- **#19 Colors:** Shared category palette — `categories.color` canonical for both Recent Transactions chip + dashboard pie/bar (`fill={cat.color}`).
- **#20 Avatar:** Fallback shows **"M" for Moneta** (brand), not initials. Uploads stored as `avatars/{userId}/{uuid}.{ext}` to avoid collision. "Unique" meant file-path uniqueness, not DB unique on `user.image`.

## Issue Inventory (Open, 2026-08-31)

| # | Title | Labels | Body Status | Type |
|---|-------|--------|-------------|------|
| 43 | assets v2: live prices (crypto+stocks), P&L, allocation pie | enhancement | **grilled 08-31** (v2 follow-up of #34) | Feature — Assets v2 |
| 44 | apply login visual language to all pages (kumo) | enhancement | **grilled 08-31** (follow-up of #35) | Feature — Design rollout |
| 45 | dashboard net worth: SUM(assets) in /summary | enhancement | **grilled 08-31** (#34 triage follow-up) | Feature — Dashboard |

> Closed for reference: #35 login redesign [CLOSED PR #42], #34 assets MVP [CLOSED PR #42], #33 mutations ledger [CLOSED PR #40], #32 monthly groups [CLOSED PR #40], #27 giant split [CLOSED PR #39], #26 dead code [CLOSED PR #39], #31 quick-add [CLOSED 08-31], #19 palette [CLOSED 08-31], #20 avatar [CLOSED 08-31], #29 a11y [CLOSED], #25 perf render [CLOSED], #24 validation [CLOSED], #23 CVEs [CLOSED], #22 monthly mismatch [CLOSED — root cause re-fixed at UTC-calendar-day canonicalization, PR #40], #18 categories global [CLOSED], #28 /test route [CLOSED]

**Rewritten bodies:** Use `gh issue view 35 --json body` to verify. All vague issues (empty/one-line) now have Summary/Goals/Proposed implementation/Acceptance/Triage notes.

## Phase Plan (Recommended Order)

### Phase 1 — Security Foundation (W1) — P0, blocks all ✅ DONE (PR #36)

- [x] **#23** Upgrade better-auth/axios/hono/drizzle-orm — `pnpm audit` zero high/critical, replace axios with `fetch` wrapper in `apps/web/src/lib/api.ts`
- [x] **#24** Tighten backend input validation — Zod regex for `amount`, `date` valid ISO, `categoryId int.positive`, `parseId` helper, try/catch `c.req.json()`

> **Exit criteria:** Security track green, validation pattern reusable for #34/#33/#31.

### Phase 2 — P0 Bugs + Small Features (W2) — after security ✅ DONE (PRs #37/#38; #19/#20/#31 closed on owner acceptance 08-31)

- [x] **#22** Monthly mismatch — time-box 1d investigation, unify UTC `DATE_TRUNC` in `dashboard.ts`, assert `SUM(monthly)==SUM(categories)` (±1c)
- [x] **#19** Shared palette — extend `getCategoryBreakdown` to return `color`, `chart-pie-categories.tsx` uses `fill={entry.color}`, remove hard-coded `COLORS` — *closed on owner visual acceptance*
- [x] **#20** Avatar fallback — `nav-user.tsx` shows "M"; no upload endpoint exists yet so `avatars/{userId}/{uuid}` path is N/A — *closed on owner acceptance*
- [x] **#31** Dashboard quick-add dialog — `add-transaction-dialog.tsx` dialog with type toggle, invalidates `["transactions"]` + `["summary"]` — *closed on owner manual acceptance*
- [x] **#25** Perf quick-wins (parallel) — lazy recharts (`React.lazy` + `<Suspense>`), memoize `currency-context` + `ChartContext`, hoist `MONTHS`, lazy `useState`, fix `js-hoist-intl`

> **Exit criteria:** Dashboard numbers trusted ✅, colors consistent ✅, dashboard entry unblocked ✅.

> **Exit criteria:** Dashboard numbers trusted, colors consistent, dashboard entry unblocked.

### Phase 3 — Refactors (W3) — must land before new pages ✅ DONE (PR #38 + phase-3-followup)

- [x] **#29** Breadcrumb a11y — fixed in PR #38; `ui/breadcrumb.tsx` later became unreachable dead code → deleted in phase-3-followup (shadcn block can be re-added when a breadcrumb UI is actually built)
- [x] **#26** Dead code — removed 7+1 unused deps (PR #38) + 3 deps orphaned by the deletions (`@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `vaul`); deleted 10 + 3 dead files (`badge.tsx`, `badge-variants.ts`, `breadcrumb.tsx`); mixed exports moved/`getCategoryColor` un-exported → **0 dead-code findings**
- [x] **#27** Split giants — `transaction-table/` + `category-breakdown-chart/` per issue spec; followup: `BreakdownPeriodNav` extracted (all files ≤200 LoC), `getStartOfDay`/`getEndOfDay` hoisted to module scope, unused `currentDate` destructure removed, columns dropdown single-pass `flatMap`

> **Exit criteria:** No `no-giant-component`/`prefer-useReducer` findings on split targets ✅, `pnpm run check` + `check-types` + build green ✅. Remaining `no-giant-component` on `category-settings.tsx` (495 LoC) was **not** in #27 scope — file a follow-up issue if desired.

### Phase 4 — Ledger UX (W4) — after #27 + #22 — ✅ DONE (PR #40; #32/#33 closed)

- [x] **#32** Monthly groups — accordion by UTC month on `/expense` + `/income`, header totals via `formatCurrency`, 6 months/page (**pagination model chosen and implemented: group-based — pages are 6 UTC-month accordion sections, a month is never split; row-level pagination removed from these two pages**)
- [x] **#33** `/mutations` ledger — UNION ALL `incomes`+`expenses` at DB level (`drizzle-orm/pg-core` `unionAll`, smoke-tested against dev Postgres), filters via Zod (invalid params → 400), server pagination 20/page, type badge, all filters/sort/page in URL query params (shareable), AddTransactionDialog wired + invalidates `["mutations"]`
- [x] **Bonus:** UTC calendar-day canonicalization (root cause of the residual #22 mismatch class, found during smoke) + `0005_utc_calendar_days` migration + `db:backfill-journal` script for push-created DBs

> **Exit criteria:** Monthly scan + full ledger both usable ✅ (pending owner smoke test), share table logic from #27 ✅ (`useTransactionFilters`, columns pattern reused).

### Phase 5 — Growth (W5+) — after refactors ✅ DONE (PR #42 merged, #34/#35 closed 08-31)

- [x] **#34** Assets MVP — `assets` table (migration `0006_groovy_kulan_gath`) + Hono CRUD (`assets.ts`, Zod-validated, UTC `DATE_TRUNC` monthly aggregation) + `/assets` route grouped by type with per-type totals + cards + lazy recharts area chart, sidebar entry `IconStack2`. API smoke-tested against dev Postgres (CRUD/validation/monthly all green; smoke user removed)
- [x] **#35** Login redesign — shadcn login-block split panel (desktop brand panel + form, mobile stacked), kumo accent `#f6821f` tokens added to `index.css` (login-scoped only; primary/surfaces/radius untouched to avoid bleed), `--brand-accent-strong` variants for WCAG-AA text contrast, autocomplete attrs on forms, initial view flipped to sign-in. Better-Auth flow unchanged
- [x] **#34 v2** filed as **#43** — ticker + provider columns (migration 0007), CoinGecko (keyless) + Alpha Vantage (env key, 25/day), in-memory TTL cache (no cache table — owner decision), P&L per holding, lazy allocation pie
- [x] **Visual rollout** filed as **#44** — all authenticated pages, tokens+typography+surfaces only (no layout/arch changes), `--brand-accent` usage, #19 palette rule + #29 contrast must survive
- [x] **Net worth** filed as **#45** — `totalAssets` in `/api/dashboard/summary` (unfiltered SUM), Net Worth card on dashboard; field name stable so #43 can swap to market value later

## Dependency Graph

```
#23 ──┐
      ├──► #24 ──► #22 ─┬─► #32 ──┐
#25 ──┘                │         ├──► #34 (MVP) ──► #34 v2
#29 ──┐                ├──► #33 ─┘
#26 ──┼──► #27 ────────┘
      └──► #35 (waits for #26 to avoid restyling dead code)
#19 ──► needs #24 (color validation) + #22 (UTC)
#31 ──► needs #24 (validation) but parallel to #27
#20 ──► trivial, anytime
```

## For the Next Agent — Checklist

- [x] Read this doc + run `gh issue list` to confirm no new issues created since 08-31 (confirmed — only #34/#35 open)
- [x] Phases 1–5 complete (PRs #36–#42 merged, #34/#35 closed). Beyond: **#43 (assets v2 prices/P&L/pie)** + **#44 (visual rollout)** + **#45 (dashboard net worth)** — owner-grilled 08-31, bodies detailed. ⚠️ Deploying: see “Deploying (DB migrations)” below — `0006` migration included in #42.
- [ ] Before coding, read issue body: `gh issue view <n> --json body | jq -r .body > /tmp/body.md && cat /tmp/body.md`
- [ ] Follow issue's Proposed implementation + Acceptance exactly — bodies are now detailed with code snippets
- [ ] Run `pnpm run check` + `pnpm run check-types` before PR (per `AGENTS.md`)
- [ ] Update this doc's checklist when issue closes (`gh issue close <n>`)

## Deploying (DB migrations) — one-time per environment

Prod/dev were created with `db:push`, so the drizzle journal
(`drizzle.__drizzle_migrations`) is incomplete and a plain `pnpm run db:migrate`
fails replaying old schema files (`column "issuer" ... already exists`).
One-time fix, then migrations are normal forever:

```bash
# 1) reconcile the journal against the migration files (idempotent)
DATABASE_URL=postgresql://<prod-credentials>@<host>/<db> \
  pnpm -F @moneta/db db:backfill-journal

# 2) apply pending migrations (first run applies 0005_utc_calendar_days — idempotent)
DATABASE_URL=postgresql://<prod-credentials>@<host>/<db> pnpm run db:migrate
```

Recommended permanent setup (deployment.md Option C): add migrate to server
startup so every deploy self-migrates:
`"start": "pnpm db:migrate && node dist/index.js"`

NOTE: `0005_utc_calendar_days` interprets *legacy* rows (entered before PR #40)
as Europe/Amsterdam. It only ever truncates to calendar days, is idempotent,
and does not affect how NEW data is stored (canonical UTC midnight, any TZ).

## Verification Commands

```bash
# live truth
gh issue list --state open --json number,title,updatedAt,labels

# body check
gh issue view 34 --json title,body --jq .body | head -n 100

# tracking doc present
ls -la doc-spec/TRACKING.md

# security audit (for #23)
pnpm audit --prod

# validation (for #24)
rg "z.number\(\)" apps/server/src/routes

# perf (for #25)
npx react-doctor@latest --json | jq '.projects[0].diagnostics | length'
```

---

**Note:** This doc mirrors GitHub Issues. Do not add new product requirements here — file a GitHub Issue first, then update this checklist.
