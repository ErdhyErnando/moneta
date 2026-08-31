# Moneta Execution Tracking — Local Agent Handoff

> **Purpose:** Local tracking mirror for agent handoff across chat sessions.  
> **Source of Truth:** GitHub Issues (`gh issue list --state open`). This doc is a **cache + phase plan**, not the spec. If in doubt, read the issue body on GitHub (rewritten 2026-08-31 via grill-me).  
> **Last Updated:** 2026-08-31 by phase-3-followup session (verified against `gh issue list` + fresh `react-doctor` scan)  
> **Stack:** React 19 + TanStack Router + Hono + Drizzle + PostgreSQL + Better-Auth

## How to Use (for any new agent)

1. Run `gh issue list --state open --limit 50 --json number,title,body,labels,state` to get live truth.
2. Use this doc only for **phase ordering + grill decisions** that are not in issue bodies.
3. When you pick an issue, read its full body: `gh issue view <number> --json title,body`
4. After completing, close issue via `gh issue close <number>` and update this doc's checklist.

## Grill Decisions Log (2026-08-31)

Locked via `ask_user_question` + `grill-me`:

- **Project Phase:** `Tech-debt + security first` — security/perf/refactor (#23, #24, #25-27, #29) before new features. Justified: reduces risk for #32-35.
- **#22 Mismatch:** Breakdown is correct, dashboard monthly bar chart is wrong. Fix dashboard's `getMonthlyData` UTC grouping, not breakdown.
- **#32 + #33:** Two pages, not one. `#32` = monthly accordion on `/expense` + `/income` (grouped by UTC month). `#33` = new `/mutations` flat combined ledger (income+expense chronologically).
- **#35 Redesign:** Login-only (shadcn `login-03/04` split-panel + kumo-ui tokens). No full-app redesign in v1.
- **#34 Asset Tracking:** MVP first, live later. v1 = manual holdings ledger (type/amount/date). No live prices. v2 will add CoinGecko (crypto, 10k/mo free) + Alpha Vantage/Finnhub (stocks) with caching.
- **#31 Dashboard Add:** Quick-add Dialog (type toggle Expense/Income) on dashboard, not navigation.
- **#19 Colors:** Shared category palette — `categories.color` canonical for both Recent Transactions chip + dashboard pie/bar (`fill={cat.color}`).
- **#20 Avatar:** Fallback shows **"M" for Moneta** (brand), not initials. Uploads stored as `avatars/{userId}/{uuid}.{ext}` to avoid collision. "Unique" meant file-path uniqueness, not DB unique on `user.image`.

## Issue Inventory (Open, 2026-08-31)

| # | Title | Labels | Body Status | Type |
|---|-------|--------|-------------|------|
| 35 | redesign for login and other page | enhancement | **rewritten 08-31** (2.8k) | Feature — Design (login-only) |
| 34 | add page for asset tracking and progress | enhancement | **rewritten 08-31** (4.2k) | Feature — Assets MVP |
| 33 | create new mutation page to see combination of expense and income in a list | enhancement | **rewritten 08-31** (3.5k) | Feature — Ledger |
| 32 | Expense and Income should be formatted as monthly list | enhancement, tech-debt | **rewritten 08-31** (3.7k) | Enhancement — Monthly grouping |
| 31 | Add Transaction Feature in dashboard isn't implemented yet | enhancement, tech-debt | **rewritten 08-31** (3.5k) | Feature — Quick-add dialog — **code merged PR #37/#38, issue open pending manual acceptance** |
| 27 | [Refactor] Split giant TransactionTable (709 LoC) and CategoryBreakdownChart — adopt useReducer | maintainability, react-doctor, tech-debt, web | detailed (3.6k) — ready | Refactor — **done in phase-3-followup, closes on merge** |
| 26 | [Maintainability] Remove 7 unused deps, 12 dead files, 3 unused exports, 7 mixed-export files | good first issue, maintainability, react-doctor, tech-debt, web | detailed (4.9k) — ready | Tech-debt — **done in phase-3-followup, closes on merge** |
| 20 | user profile image should be unique | enhancement | **rewritten 08-31** (3.3k) | Enhancement — Avatar fallback — **"M" fallback merged; no upload endpoint exists yet, so uniqueness clause is moot; issue open pending manual acceptance** |
| 19 | breakdown by category in dashboard | enhancement | **rewritten 08-31** (3.8k) | Bug — Palette — **shared palette merged (categoryColor through dashboard.ts + getCategoryFill); issue open pending visual/curl acceptance** |

> Closed for reference: #29 a11y [CLOSED], #25 perf render [CLOSED], #24 validation [CLOSED], #23 CVEs [CLOSED], #22 monthly mismatch [CLOSED], #18 categories global [CLOSED], #28 /test route [CLOSED]

> Closed for reference: #18 categories are still global [CLOSED], #28 Remove /test debug route [CLOSED]

**Rewritten bodies:** Use `gh issue view 35 --json body` to verify. All vague issues (empty/one-line) now have Summary/Goals/Proposed implementation/Acceptance/Triage notes.

## Phase Plan (Recommended Order)

### Phase 1 — Security Foundation (W1) — P0, blocks all ✅ DONE (PR #36)

- [x] **#23** Upgrade better-auth/axios/hono/drizzle-orm — `pnpm audit` zero high/critical, replace axios with `fetch` wrapper in `apps/web/src/lib/api.ts`
- [x] **#24** Tighten backend input validation — Zod regex for `amount`, `date` valid ISO, `categoryId int.positive`, `parseId` helper, try/catch `c.req.json()`

> **Exit criteria:** Security track green, validation pattern reusable for #34/#33/#31.

### Phase 2 — P0 Bugs + Small Features (W2) — after security — code merged, 3 issues pending manual acceptance

- [x] **#22** Monthly mismatch — time-box 1d investigation, unify UTC `DATE_TRUNC` in `dashboard.ts`, assert `SUM(monthly)==SUM(categories)` (±1c)
- [ ] **#19** Shared palette — extend `getCategoryBreakdown` to return `color`, `chart-pie-categories.tsx` uses `fill={entry.color}`, remove hard-coded `COLORS` — *code merged PR #37; issue open pending visual/curl acceptance*
- [ ] **#20** Avatar fallback — `nav-user.tsx` shows "M"; no upload endpoint exists yet so `avatars/{userId}/{uuid}` path is N/A — *code merged PR #37; issue open pending acceptance*
- [ ] **#31** Dashboard quick-add dialog — `add-transaction-dialog.tsx` dialog with type toggle, invalidates `["transactions"]` + `["summary"]` — *code merged PR #37/#38; issue open pending manual acceptance*
- [x] **#25** Perf quick-wins (parallel) — lazy recharts (`React.lazy` + `<Suspense>`), memoize `currency-context` + `ChartContext`, hoist `MONTHS`, lazy `useState`, fix `js-hoist-intl`

> **Exit criteria:** Dashboard numbers trusted, colors consistent, dashboard entry unblocked.

### Phase 3 — Refactors (W3) — must land before new pages ✅ DONE (PR #38 + phase-3-followup)

- [x] **#29** Breadcrumb a11y — fixed in PR #38; `ui/breadcrumb.tsx` later became unreachable dead code → deleted in phase-3-followup (shadcn block can be re-added when a breadcrumb UI is actually built)
- [x] **#26** Dead code — removed 7+1 unused deps (PR #38) + 3 deps orphaned by the deletions (`@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `vaul`); deleted 10 + 3 dead files (`badge.tsx`, `badge-variants.ts`, `breadcrumb.tsx`); mixed exports moved/`getCategoryColor` un-exported → **0 dead-code findings**
- [x] **#27** Split giants — `transaction-table/` + `category-breakdown-chart/` per issue spec; followup: `BreakdownPeriodNav` extracted (all files ≤200 LoC), `getStartOfDay`/`getEndOfDay` hoisted to module scope, unused `currentDate` destructure removed, columns dropdown single-pass `flatMap`

> **Exit criteria:** No `no-giant-component`/`prefer-useReducer` findings on split targets ✅, `pnpm run check` + `check-types` + build green ✅. Remaining `no-giant-component` on `category-settings.tsx` (495 LoC) was **not** in #27 scope — file a follow-up issue if desired.

### Phase 4 — Ledger UX (W4) — after #27 + #22 — **READY TO START**

- [ ] **#32** Monthly groups — accordion by UTC month on `/expense` + `/income`, header totals via `formatCurrency`, 6 months/page
- [ ] **#33** `/mutations` ledger — UNION `incomes`+`expenses` at DB level, filters via Zod, paginated, type badge, URL query params

> **Exit criteria:** Monthly scan + full ledger both usable, share table logic from #27.

### Phase 5 — Growth (W5+) — after refactors

- [ ] **#34** Assets MVP — DB `assets` table + Hono CRUD (`assets.ts`) + `/assets` route with holdings grouped by type + monthly progress chart (lazy recharts)
- [ ] **#35** Login redesign — shadcn block variant + kumo-ui tokens in `index.css`, responsive + dark mode, `better-auth` flow unchanged
- [ ] **#34 v2** follow-up (separate issue) — ticker + CoinGecko/Alpha Vantage with daily cache, allocation pie (not in this phase)

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

- [ ] Read this doc + run `gh issue list` to confirm no new issues created since 08-31
- [ ] Phases 1–3 are merged (PRs #36, #37, #38 + phase-3-followup). Pick next issue from **Phase 4** (#32, #33) — do not jump to #34/#35 before Phase 4
- [ ] Before coding, read issue body: `gh issue view <n> --json body | jq -r .body > /tmp/body.md && cat /tmp/body.md`
- [ ] Follow issue's Proposed implementation + Acceptance exactly — bodies are now detailed with code snippets
- [ ] Run `pnpm run check` + `pnpm run check-types` before PR (per `AGENTS.md`)
- [ ] Update this doc's checklist when issue closes (`gh issue close <n>`)

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
