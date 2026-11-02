# Moneta Design Contract

Single written reference for Moneta's visual language. If a value isn't in this file, it isn't a
token — it's a bug.

- **Scope:** the authenticated app (`apps/web/src/routes/_authenticated/*`), auth screens, shared
  components in `apps/web/src/components/`.
- **Source of truth for values:** `apps/web/src/index.css`. This doc explains *intent and rules*;
  the CSS holds the actual numbers. Never copy token values into components.
- **Origin:** kumo-ui direction introduced with the login redesign (#35, PR #42), now promoted to
  the whole app (#44).
- **Supersedes:** `doc-spec/color-scheme.md` (a raw generator dump with a completely different
  orange/teal palette, referenced by nothing). Archived by this contract.

> Status: applied on branch `style/44-design-contract-tokens`. The values below are what
> `index.css` contains today — if they ever diverge, the CSS is wrong, not this table.

---

## 1. Direction

Warm neutrals, one accent, quiet surfaces, generous but not bubbly radius, flat cards.

| Principle | Meaning in practice |
|---|---|
| Warm, not cool | No blue-cast greys. Text and borders sit on the warm side of neutral. |
| One accent | `#f6821f` is the only brand hue. It appears in small doses: primary CTA, active nav, single-series charts, key numbers. Never as decoration on every card. |
| Flat by default | Cards are `border` + `bg-card`, no shadow. Shadow is reserved for things that float (dialog, popover, dropdown, toast, sheet). |
| Quiet borders | `--border` is a hairline. If a divider is doing the work of hierarchy, the type scale failed. |
| Data over chrome | Charts and tables get the contrast budget. Chrome stays muted. |

**Out of scope for this contract:** navigation structure, route changes, new features, marketing
pages.

---

## 2. Tokens

All defined in `apps/web/src/index.css`. Components consume them through Tailwind utilities
(`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`…) — never as raw CSS vars in
JSX, and never as literal hexes.

### 2.1 Neutrals (warm)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `oklch(0.9232 0.0026 48.7171)` | `oklch(0.2244 0.0074 67.437)` | Page canvas |
| `--card` / `--popover` | `oklch(0.9699 0.0013 106.4238)` | `oklch(0.2801 0.008 59.3379)` | Raised surfaces, overlays |
| `--muted` | `oklch(0.9232 0.0026 48.7171)` | `oklch(0.2287 0.0074 67.4469)` | Inset surfaces, hover fills |
| `--secondary` / `--border` / `--input` | `oklch(0.8687 0.0043 56.366)` | `oklch(0.3359 0.0077 59.4197)` | Hairlines, secondary buttons |
| `--foreground` | `oklch(0.26 0.008 60)` | `oklch(0.93 0.008 70)` | Body text. Warmed off the old cool navy (`260.031` / `255.5078` hue). |
| `--muted-foreground` | `oklch(0.52 0.01 60)` | `oklch(0.715 0.01 70)` | Secondary text, chart ticks, captions |
| `--secondary-foreground` | `oklch(0.45 0.012 60)` | `oklch(0.88 0.008 70)` | Secondary button label |
| `--accent` / `--sidebar-accent` | `oklch(0.945 0.008 70)` | `oklch(0.3896 0.0074 59.4734)` | Hover/fill surface. Was a violet-theme pink tint (`321.9388` hue). |
| `--accent-foreground` | `oklch(0.28 0.01 60)` | `oklch(0.88 0.008 70)` | Text on hover surfaces |

Only the text and hover tokens were retuned — the surface ramp (`--background`, `--card`,
`--muted`, `--border`) is deliberately untouched so the login doesn't shift.

### 2.2 Brand and primary

The accent cannot carry white text: `#f6821f` on white is **2.58:1**. A primary CTA therefore uses a
near-black label, which is also what kumo/AWS does.

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--brand-accent` | `#f6821f` | `#f6821f` | Fills: CTA bg, active nav, single-series charts, tint bases |
| `--brand-accent-foreground` | `#1a1512` | `#1a1512` | Text/icons **on** the accent. 6.7:1 |
| `--brand-accent-subtle` | `color-mix(in oklab, var(--brand-accent) 10%, transparent)` | same | Accent tint for icon chips, gradients, badges |
| `--brand-accent-strong` | `#92400e` | `#fdba74` | Accent used as **text**, links, emphasis. 6.6:1 light / 7.1:1 dark |
| `--primary` | `var(--brand-accent)` | same | So `bg-primary` is on-brand everywhere with no per-component overrides |
| `--primary-foreground` | `var(--brand-accent-foreground)` | same | |
| `--ring` | `var(--brand-accent-strong)` | same | **Not** the raw accent: `#f6821f` is only 2.4:1 on card and fails WCAG 1.4.11 (3:1 non-text) |

**Accent rules**

- Primary CTA, active sidebar/nav item, focus ring, single-series chart, icon tint at 10–12%
  opacity.
- ❌ Never body text in light mode (use `--brand-accent-strong`).
- ❌ Never a border or a 1px indicator (fails 3:1 against the canvas).
- ❌ Never a category/series color once a chart uses `categories.color` (see §4).
- Replace the magic `/10`, `/5` opacity values in `routes/login.tsx` with
  `bg-brand-accent-subtle` / `from-brand-accent-subtle` so the tint lives in one place (pending in
  the login batch).

**Contrast floor:** 4.5:1 body text, 3:1 large text and UI borders. When in doubt, verify before
committing.

### 2.3 Status (P&L, destructive)

The old values were hardcoded in `components/dashboard/summary-cards.tsx` (`text-emerald-600`,
`text-rose-600`) and in `components/ui/button-variants.ts` (white on `--destructive` = **3.76:1**,
a fail). Tokens now exist; the summary cards adopt them in the dashboard batch, and
`button-variants.ts` already uses `text-destructive-foreground` and no longer dims to
`bg-destructive/60` in dark mode.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--positive` | `#047857` | `#34d399` | Income, gains. 5.1:1 |
| `--negative` | `#be123c` | `#fb7185` | Expenses, losses. 5.8:1 |
| `--destructive` / `--destructive-foreground` | `#b91c1c` / `#ffffff` (6.5:1) | `#ef4444` / `#1a1512` (4.6:1) | Delete buttons, danger dialogs |

**Rule:** a color never carries meaning alone. Every P&L value keeps its sign, its arrow icon, and
its text label (#29). Colorblind users read the label, not the green.

### 2.4 Charts

Chosen direction: a **monochrome accent ramp** for the sequential/single-series palette.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` | `#f6821f` | `#f6821f` | Primary series / gradient start |
| `--chart-2` | `#fb923c` | `#fb923c` | Gradient stop 2 |
| `--chart-3` | `#fdba74` | `#fdba74` | Gradient stop 3 |
| `--chart-4` | `#fed7aa` | `#fed7aa` | Gradient stop 4 / faint fills |
| `--chart-5` | `#ffedd5` | `#ffedd5` | Faintest tint |
| `--chart-positive` | `= --positive` | `= --positive` | Income series |
| `--chart-negative` | `= --negative` | `= --negative` | Expense series |
| `--chart-grid` | `= --border` | `= --border` | Gridlines |
| `--chart-axis` | `= --muted-foreground` | `= --muted-foreground` | Ticks, labels |

**The ramp is sequential, not categorical.** Five orange tints cannot distinguish "income vs
expenses" — two-series comparisons use `--chart-positive` / `--chart-negative` (which is already
today's behavior: green area, red line). Use `--chart-1..5` for one-series charts, gradients, and
heat scales.

**Category colors stay canonical** (#19): `categories.color` from the DB drives breakdown charts and
badges. Do not re-hardcode a palette in a chart component.

### 2.5 Radius and elevation

| Token | Value | Effect |
|---|---|---|
| `--radius` | `0.75rem` (12px) | Cards `rounded-xl` → 16px, buttons `rounded-md` → 10px, dialogs 12px |

The previous 20px base read as bubbly for a data-dense finance app. 12px is the kumo/console
middle ground.

**Shadows:** the hand-rolled ramp (`--shadow-sm` = `2px 2px 10px 4px …`) is gone — no component
rendered a shadow on a card, so it was pure dead weight. Both the `:root`/`.dark` blocks **and** the
matching lines in `@theme inline` were deleted together; deleting only the first set would map
`shadow-md` to an undefined var and silently break every overlay. Tailwind's defaults now apply:
cards `border` only, popover `shadow-md`, dialog / dropdown / toast / sheet `shadow-lg`.

### 2.6 Type scale

Font: `Google Sans Flex` (loaded via `@import` in `index.css` — flagged in §7).

| Role | Classes |
|---|---|
| Page title | `text-2xl sm:text-3xl font-semibold tracking-tight` |
| Page description | `text-sm text-muted-foreground` (never below `/80` opacity) |
| Section title | `text-base font-semibold` |
| Card title | `font-semibold leading-none` (from `CardTitle`) |
| Metric value | `text-2xl font-semibold tabular-nums` |
| Body / table cell | `text-sm` |
| Caption / axis / badge | `text-xs` |
| Money (everywhere) | + `tabular-nums`. No exceptions. |

One page title recipe only. Today there are four: `text-3xl` (settings, dashboard), `text-2xl
sm:text-3xl` (expenses, income, assets, mutations, breakdowns), `text-3xl` without tracking
(starting-balance).

---

## 3. Component recipes

### Page header — `apps/web/src/components/page-header.tsx` (new, deliberate exception to #44)

The one new abstraction allowed in the styling pass: it's what prevents 7 pages from drifting again.

```tsx
<PageHeader
  title="Expenses"
  description="Everything you've spent, by category."
  actions={<Button>Add transaction</Button>}
/>
```

Rules: one `<PageHeader>` per route, directly inside the page container, first child.
`actions` holds at most one primary CTA plus secondary controls (filters, selects).

### Surfaces

| Element | Recipe |
|---|---|
| Card | `<Card>` as-is: `rounded-xl border bg-card` — **no shadow** |
| Card header | `CardHeader` + `CardTitle` (+ `CardDescription` for the quiet line) |
| Inset / sub-panel | `rounded-lg border bg-muted/40` or `bg-muted` |
| Table shell | `components/data-table-shell.tsx`: `rounded-xl border bg-card`, header row `border-b`, no zebra |

### Buttons

| Intent | Recipe |
|---|---|
| Primary CTA | `variant="default"` → `bg-primary text-primary-foreground` (accent + near-black after the token migration) — **one per page**, in the header |
| Secondary | `variant="outline"` for filters/selects, `variant="ghost"` for icon-only |
| Destructive | `variant="destructive"` — only inside confirm dialogs |
| Icon buttons | `size="icon"` (+ `aria-label`, always) |

### Status and money

| Case | Recipe |
|---|---|
| Income / positive | `text-positive` + `+` prefix + `ArrowUpRight` |
| Expense / negative | `text-negative` + `−` prefix + `ArrowDownRight` |
| Neutral balance | `text-foreground`, no color |
| Overdue / warning | `text-brand-accent-strong`, never raw `text-amber-600` |

### Category tint

`components/category-badge.tsx` currently cycles 11 raw Tailwind palettes (`bg-blue-100`,
`text-indigo-700`…). Replace with a `CATEGORY_TINTS` map of ~8 hue families, each with a light/dark
pair that passes 4.5:1 (`text-*-700` on `*-100`, `text-*-300` on `*-900/30`). Keep it index-stable:
arrays are data, not decoration — don't reorder.

---

## 4. Charts

Applies to `components/chart-*.tsx`, `components/monthly-bar-chart.tsx`,
`components/assets/assets-chart.tsx`, `components/category-breakdown-chart/*`.

1. Series color comes from a token: `--chart-1..5` (single series / gradient),
   `--chart-positive|negative` (two-series comparison), or `categories.color` (breakdown, #19).
2. Gridlines `--chart-grid`, ticks `--chart-axis` at `text-xs tabular-nums`. No axis lines.
3. Tooltips: `bg-popover text-popover-foreground border-border`, rounded, no shadow beyond
   `shadow-md`.
4. Area gradients: `--chart-1` → transparent over 4 stops. Bar fills stay solid (gradients on thin
   bars read as banding).
5. Legends only when ≥2 series. Percent labels stay outside the pie for slices >8%.
6. Charts remain `React.lazy` (#48). Never import a chart module from a route that renders on first
   paint, and never from `main.tsx`.
7. Respect `prefers-reduced-motion` for any entrance/reveal animation.

### 4.1 EvilCharts migration (separate PR, after #44)

Decision: adopt `@evilcharts/recharts-*` through the shadcn registry, one engine (Recharts) only.

| Concern | Rule |
|---|---|
| Distribution | Source-copied via `npx shadcn@latest add @evilcharts/recharts-{area,bar,pie}-chart`. Land in `apps/web/src/components/charts/evilcharts/` — **never** `components/ui/`, or the CLI overwrites `ui/chart.tsx`. |
| Recharts version | Repo is on `2.15.4`; EvilCharts builds against Recharts 3.x. If the registry forces 3.x, **that bump is its own PR** with `pnpm build` + chart smoke test, before any chart is ported. |
| Colors | EvilCharts takes `({ label, colors: { light: string[], dark: string[] } })` and compiles per-chart CSS vars. Write **one adapter** in `lib/chart-theme.ts` mapping §2.4 tokens → that shape. No hexes in chart files. |
| Bundle | Brings `motion` (+ `@number-flow/react`). It must stay inside the lazy chart chunks — verify the build's chunk output, not just `vite dev`. |
| Next-isms | Generated files ship `"use client"` (harmless in Vite) and `@/registry/...` imports — rewrite to `@/components/...`. |
| Dynamic slices | Pie/breakdown color is per-datum (`categories.color`), EvilCharts config is per-series key. Verify per-datum color support; if absent, keep that chart on shadcn and record the exception here. |
| Port order | assets area → dashboard area → monthly bars → category pie **last**. |

---

## 5. Guardrails

Before opening a styling PR:

```bash
# 1. no raw colors leaked into components
grep -rnE "(text|bg|border|from|to|ring)-\[#|text-(indigo|blue|emerald|rose|red|green|amber|cyan|teal|purple|pink|orange|yellow|lime|sky|violet|fuchsia)-[0-9]" \
  apps/web/src --include=*.tsx

# 2. no hardcoded money colors, no non-tabular numerals in tables/charts
grep -rn "text-emerald\|text-rose\|text-green-\|text-red-" apps/web/src --include=*.tsx

# 3. gates
pnpm run check && pnpm run -F web check-types && pnpm run -F web build
```

Then by hand:

- [ ] Light **and** dark screenshots for every touched page
- [ ] 375px / 768px / 1440px spot-check (no clipped headers, no horizontal scroll in tables)
- [ ] Accent used ≤2× per screen and never as body text in light mode
- [ ] Every P&L number has a sign/label, not just color
- [ ] `aria-label` on every icon-only control
- [ ] Zero new react-doctor findings (`/doctor`)

---

## 6. Execution plan

| Step | Content | Files |
|---|---|---|
| 1 | This contract | `docs/design.md` |
| 2 | ✅ Token migration: brand/primary/ring mapping, status tokens, chart ramp, radius `1.25rem→0.75rem`, warm text neutrals, warm hover surfaces, dead shadow ramp removed (CSS **and** `@theme inline`), `color-scheme` bound to the theme class | `apps/web/src/index.css`, `components/ui/button-variants.ts` |
| 3 | `PageHeader` + category tint map + surface recipes | `components/page-header.tsx`, `components/category-badge.tsx` |
| 4 | Dashboard batch: header, summary card status colors, chart cards | `routes/_authenticated/index.tsx`, `components/dashboard/*`, `components/chart-*.tsx` |
| 5 | Ledger batch: expense, income, mutations (+ breakdowns) — table shell, filters, dialogs | `routes/_authenticated/{expense,income,mutations}*.tsx`, `components/data-table*.tsx`, `components/transaction-*.tsx` |
| 6 | Holdings batch: assets, starting-balance, settings | `routes/_authenticated/{assets,starting-balance,settings}.tsx` |
| 7 | EvilCharts (separate track, §4.1) | `components/charts/evilcharts/*`, `lib/chart-theme.ts` |

Steps 4–6 are independent PRs, each with before/after screenshots in both themes.

---

## 7. Known issues / follow-ups

1. **Accent vs category collision.** Seed palette has `Transportation #f97316` (and `Gift #f59e0b`)
   sitting in the same hue band as `#f6821f`. On the dashboard, the brand accent and a category
   color can appear side by side and read as the same series. Options: shift those seed hues ~40°
   (affects new installs only), or keep the accent out of any view that renders category colors.
   Needs a decision before the dashboard batch.
2. **`--destructive` failed contrast** (white on `oklch(0.6368 0.2078 25.3313)` ≈ 3.76:1).
   Fixed in step 2 — token is now `#b91c1c` and `button-variants.ts` uses
   `text-destructive-foreground` instead of hardcoded `text-white`.
3. **Stale palette doc.** `doc-spec/color-scheme.md` describes a different (orange/teal) theme and is
   referenced by nothing. Archive it in the token-migration commit.
4. **`html, body` still paints raw colors** (`bg-white dark:bg-gray-950`) rather than
   `--background`. Left alone deliberately: the login's form panel relies on the white canvas, so
   switching it to the token greys the auth screen. Give the login its own surface token first.
5. **`doc-spec/chart-example.md`** documents the old violet `--chart-1..5` ramp. Rewrite or delete
   it when the chart PR lands.
6. **Pie fallback palette is broken** — `components/chart-pie-categories.tsx` references
   `var(--chart-6)` and `var(--chart-8)`, which have never existed, plus `--sidebar*` tokens that are
   not chart colors. Fix in the dashboard batch.
7. **Render-blocking font.** `@import` of Google Sans Flex at the top of `index.css` blocks first
   paint. Out of scope here — self-host or preconnect in a separate perf PR.
4. **Dead shadow tokens.** The custom `--shadow-*` ramp is never used; see §2.5 for the safe removal
   order.
5. **Render-blocking font.** `@import` of Google Sans Flex at the top of `index.css` blocks first
   paint. Out of scope here — self-host or preconnect in a separate perf PR.
