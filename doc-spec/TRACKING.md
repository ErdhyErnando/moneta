# Moneta Execution Tracking — Local Agent Handoff

> **Purpose:** Local tracking mirror for agent handoff across chat sessions.  
> **Source of Truth:** GitHub Issues (`gh issue list --state open`). This doc is a **cache + phase plan**, not the spec. If in doubt, read the issue body on GitHub (rewritten 2026-08-31 via grill-me).  
> **Last Updated:** 2026-08-31 by grill-me session (Tech Lead + EM)  
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
| 31 | Add Transaction Feature in dashboard isn't implemented yet | enhancement, tech-debt | **rewritten 08-31** (3.5k) | Feature — Quick-add dialog |
| 29 | [Accessibility] breadcrumb role="link" → real <a>, banned TS type in __root.tsx | good first issue, accessibility, react-doctor, web | detailed (3.7k) — ready | Tech-debt — a11y |
| 27 | [Refactor] Split giant TransactionTable (709 LoC) and CategoryBreakdownChart — adopt useReducer | maintainability, react-doctor, tech-debt, web | detailed (3.6k) — ready | Refactor — Giant components |
| 26 | [Maintainability] Remove 7 unused deps, 12 dead files, 3 unused exports, 7 mixed-export files | good first issue, maintainability, react-doctor, tech-debt, web | detailed (4.9k) — ready | Tech-debt — Cleanup |
| 25 | [Performance] Lazy-load recharts, memoize context values, hoist statics — 21 render findings | performance, react-doctor, tech-debt, web | detailed (9.2k) — ready | Perf — Render |
| 24 | [Security] Tighten backend input validation in expense/income/category routes | bug, security, server | detailed (4.8k) — ready | Security — Validation |
| 23 | [Security] Upgrade better-auth/axios/hono/drizzle-orm — fix critical & high CVEs | security, dependencies | detailed (6.8k) — ready | Security — CVEs |
| 22 | monthly expenses in dashboard and in expense breakdown are still mismatch | bug | **rewritten 08-31** (4.6k) | Bug — P0 |
| 20 | user profile image should be unique | enhancement | **rewritten 08-31** (3.3k) | Enhancement — Avatar fallback |
| 19 | breakdown by category in dashboard | enhancement | **rewritten 08-31** (3.8k) | Bug — Palette |

> Closed for reference: #18 categories are still global [CLOSED], #28 Remove /test debug route [CLOSED]

**Rewritten bodies:** Use `gh issue view 35 --json body` to verify. All vague issues (empty/one-line) now have Summary/Goals/Proposed implementation/Acceptance/Triage notes.

## Phase Plan (Recommended Order)

### Phase 1 — Security Foundation (W1) — P0, blocks all

- [ ] **#23** Upgrade better-auth/axios/hono/drizzle-orm — `pnpm audit` zero high/critical, replace axios with `fetch` wrapper in `apps/web/src/lib/api.ts`
- [ ] **#24** Tighten backend input validation — Zod regex for `amount`, `date` valid ISO, `categoryId int.positive`, `parseId` helper, try/catch `c.req.json()`

> **Exit criteria:** Security track green, validation pattern reusable for #34/#33/#31.

### Phase 2 — P0 Bugs + Small Features (W2) — after security

- [ ] **#22** Monthly mismatch — time-box 1d investigation, unify UTC `DATE_TRUNC` in `dashboard.ts`, assert `SUM(monthly)==SUM(categories)` (±1c)
- [ ] **#19** Shared palette — extend `getCategoryBreakdown` to return `color`, `chart-pie-categories.tsx` uses `fill={entry.color}`, remove hard-coded `COLORS`
- [ ] **#20** Avatar fallback — `nav-user.tsx` + `app-sidebar.tsx` show "M", unique upload path `avatars/{userId}/{uuid}`
- [ ] **#31** Dashboard quick-add dialog — `add-transaction-dialog.tsx` dialog with type toggle, invalidates `["transactions"]` + `["summary"]`
- [ ] **#25** Perf quick-wins (parallel) — lazy recharts (`React.lazy` + `<Suspense>`), memoize `currency-context` + `ChartContext`, hoist `MONTHS`, lazy `useState`, fix `js-hoist-intl`

> **Exit criteria:** Dashboard numbers trusted, colors consistent, dashboard entry unblocked.

### Phase 3 — Refactors (W3) — must land before new pages

- [ ] **#29** Breadcrumb a11y — `BreadcrumbLink` as `<a>` + `BreadcrumbPage` with `aria-current="page"`, fix `__root.tsx` banned type
- [ ] **#26** Dead code — remove 7+1 unused deps, verify 12 unused files via `rg`, move non-component exports to `*-variants.ts`
- [ ] **#27** Split giants — `transaction-table/` (orchestrator + `use-transaction-table-state.ts` + columns/toolbar/pagination) and `category-breakdown-chart/` (hook + chart), `useReducer` for 5 `useState`s, no file >200 LoC

> **Exit criteria:** No `no-giant-component`/`prefer-useReducer` findings, clean base for #32/#33.

### Phase 4 — Ledger UX (W4) — after #27 + #22

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
- [ ] Pick next issue from Phase 1 (currently #23) — do not jump to #34/#35 before Phases 1-3
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
