# Moneta Design Contract v2

Single source of truth for Moneta's visual language, on **kumo** vocabulary and the **green brand**
from the logo. If a value isn't in this file it isn't a token — it's a bug.

- **Scope:** the authenticated app (`apps/web/src/routes/_authenticated/*`), auth screens, shared
  components in `apps/web/src/components/`.
- **Values live in** `apps/web/src/index.css`. This doc states intent, rules and measured contrast;
  the CSS holds the numbers. Never copy token values into components.
- **Supersedes** the orange contract (v1, same branch) and `doc-spec/color-scheme.md` (archived).
  The **EvilCharts** direction is **dropped** (D6) — charts are kumo Charts / ECharts.
- **Inputs:** issue #44 decisions D1–D8, the owner addendum D9–D14, and the Phase 0 spike report
  (GO WITH CAVEATS). Where this doc and those conflict, this doc is the bug.

Contrast figures below are **measured** (OKLCH → linear sRGB → WCAG 2.x relative luminance), not
copied. `text >= 4.5:1`, `UI >= 3:1`.

---

## 1. Direction & principles

Quiet kumo surfaces, one green accent derived from the logo, compact density, data over chrome.

| Principle | In practice |
|---|---|
| Green, not orange | Brand hue is **156°** (logo coin measures 156). `#f6821f` is retired everywhere. |
| Neutral, not warm | Surfaces and text use **kumo's achromatic ramp**. Warm tint is gone (D-open-q1 → kumo ramp). |
| One accent | Brand appears on: primary CTA, active nav, focus ring, single-series chart. Never as body text, never on numbers. |
| Compact | Default control height **36px** (`kumo` `size="base"`); 26px only inside dense rows/toolbars. |
| Data over chrome | Charts, tables and money get the contrast budget; chrome stays muted. |
| Flat by default | Cards = hairline border, no shadow. Shadows only on floating layers. |
| Never color alone | Every P&L value carries sign + arrow + label (#29). Category marks always carry a name. |

---

## 2. Color

### 2.1 Token model

kumo ships **semantic tokens**; we do not invent a parallel palette. Phase 1 CSS keeps the legacy
shadcn variable names as aliases so the app renders unchanged until the Phase 2 wiring lands.

| Purpose | kumo utility | kumo variable | Phase 1 alias (index.css) |
|---|---|---|---|
| Page background | `bg-kumo-canvas` | `--color-kumo-canvas` | `--background` |
| Card / default surface | `bg-kumo-base` | `--color-kumo-base` | `--card`, `--popover` |
| Raised surface | `bg-kumo-elevated` | `--color-kumo-elevated` | `--accent` |
| Recessed surface | `bg-kumo-recessed` | `--color-kumo-recessed` | `--secondary` |
| Hover / zebra tint | `bg-kumo-tint` | `--color-kumo-tint` | `--muted` |
| Control fill (input, select) | `bg-kumo-control` | `--color-kumo-control` | `--card` |
| Brand fill | `bg-kumo-brand` | `--color-kumo-brand` | `--brand` → `--primary` |
| Brand fill hover | `bg-kumo-brand-hover` | `--color-kumo-brand-hover` | `--brand-hover` |
| Brand text / link | `text-kumo-brand` | `--text-color-kumo-brand` | `--brand-strong` |
| Focus ring | `ring-kumo-focus` | `--color-kumo-focus` | `--ring` |
| Hairline border | `border-kumo-hairline` | `--color-kumo-hairline` | `--border`, `--input` |
| Edge of elevated surface | `border-kumo-line` | `--color-kumo-line` | `--border` (floating) |
| Body text | `text-kumo-default` | `--text-color-kumo-default` | `--foreground` |
| Strong text | `text-kumo-strong` | `--text-color-kumo-strong` | `--foreground` (headings) |
| Muted text | `text-kumo-subtle` | `--text-color-kumo-subtle` | `--muted-foreground` |
| Disabled text | `text-kumo-inactive` | `--text-color-kumo-inactive` | `--muted-foreground` |
| Danger (text/fill) | `text-kumo-danger` / `bg-kumo-danger` | `--color-kumo-danger` | `--destructive` |

Brand override surface (spike §1, D14) is exactly these five, nothing else:

```
--color-kumo-brand, --color-kumo-brand-hover, --text-color-kumo-brand,
--color-kumo-focus, --kumo-button-emphasis-*   (the last follow --color-kumo-brand automatically)
```

### 2.2 Brand (hue 156)

| Token | Light | Dark | Measured contrast |
|---|---|---|---|
| `--brand` (fill) | `oklch(0.52 0.10 156)` `#2e7a50` | `oklch(0.72 0.11 156)` `#66b987` | vs base **5.23:1 / 8.08:1** · vs canvas **5.05:1 / 8.70:1** |
| `--brand-hover` | `oklch(0.48 0.095 156)` `#266d46` | `oklch(0.76 0.11 156)` `#73c694` | vs base **6.25:1 / 9.34:1** |
| `--brand-foreground` | `#ffffff` | `#0f1912` | on brand **5.23:1 / 7.58:1** · on hover **6.25:1 / 8.76:1** |
| `--brand-strong` (text, links) | `oklch(0.42 0.085 156)` `#1c5b39` | `oklch(0.80 0.10 156)` `#87d1a3` | vs base **8.06:1 / 10.66:1** · vs canvas **7.79:1 / 11.47:1** |
| `--brand-subtle` | `color-mix(in oklab, var(--brand) 10%, transparent)` | same | decorative only |

Rules:

- ✅ Fill for primary CTA, active nav marker, 1px indicators, **focus ring** (`--ring = --brand`; ≥4.8:1 vs card, clears 3:1).
- ✅ `--brand-strong` when the brand *is* text (links, inline keywords).
- ✅ `--brand-foreground` is the only label color on brand fills; in dark mode it is near-black (`#0f1912`), never white (white on `#66b987` = **2.4:1**, a fail).
- ❌ Never on a monetary value (§2.4).
- ❌ Never as a category/series color once a chart uses `categories.color`.

### 2.3 Neutrals — kumo's ramp (decision)

**Decision (open question 1): adopt kumo's own ramp; delete our warm neutrals.** Rationale: fewer
custom tokens, closest to the kumo look, and it is the only ramp whose dark surfaces the brand and
status colors were measured against. Phase 1 keeps the warm values as placeholders; Phase 2 replaces
them with these (kumo's values, verified from `theme-kumo.css`).

| kumo token | Light | Dark | `text-subtle` on it (L/D) | `text-default` on it (L/D) |
|---|---|---|---|---|
| `canvas` | `#fbfbfb` | `#030303` | 4.58 / 7.98 | 17.12 / 18.92 |
| `base` (cards) | `#ffffff` | `#0f0f0f` | 4.74 / 7.42 | 17.72 / 17.58 |
| `elevated` | `#f8f8f8` | `#060606` | 4.46 / 7.84 | 16.68 / 18.59 |
| `recessed` | `#f2f2f2` | `#0b0b0b` | 4.24 / 7.62 | 15.83 / 18.05 |
| `tint` (hover/zebra) | `#f5f5f5` | `#262626` | 4.35 / 5.86 | 16.25 / 13.88 |
| `control` (inputs) | `#ffffff` | `#181818` | 4.74 / 6.87 | 17.72 / 16.29 |
| `hairline` | `#e9e9e9` | `#262626` | — (decorative) | — |
| `line` | `#d4d4d4` | `#333333` | — (edge of elevated) | — |

Text tokens on `base`: `text-default` **17.72 / 17.58**, `text-strong` **19.80 / 18.36**,
`text-subtle` **4.74 / 7.42**, `text-placeholder` `#a1a1a1 / #737373` = **2.58 / 4.04**.

> `text-placeholder` is kumo's value and is **below 4.5:1 in light**. Acceptable only because every
> field has a persistent visible label (§7.4) — a placeholder is never the only label. Do not use
> `text-placeholder` for anything else.

Hairlines are decorative: WCAG 1.4.11 applies to *meaningful* boundaries, which use `line`
(≥3:1 vs adjacent surface when it carries meaning, e.g. input borders use `line`, not `hairline`).

### 2.4 Status — positive shares the brand hue family **by design**

Income green and brand green are deliberately the same hue family (fintech convention). They are
separated by **usage**, not by hue:

- **Brand never colors a number.**
- Positive/negative only color P&L values, and every one of those always has sign + arrow + label
  (#29).

| Token | Light | Dark | vs base | vs canvas |
|---|---|---|---|---|
| `--positive` | `oklch(0.48 0.11 156)` `#116f42` | `oklch(0.78 0.13 156)` `#69d094` | **6.22:1 / 10.09:1** | 6.01 / 10.85 |
| `--negative` | `#be123c` | `#fb7185` | **6.29:1 / 7.12:1** | 6.07 / 7.66 |

Both clear the 4.5:1 text bar with margin (issue target was ≥4.5:1; the old `#047857` / `#34d399`
pair sat at hue 166 and is retired).

### 2.5 Destructive

| Token | Light | Dark | Contrast |
|---|---|---|---|
| `--destructive` | `#b91c1c` | `#ef4444` | vs base **6.47:1 / 5.09:1** |
| `--destructive-foreground` | `#ffffff` | `#0f1912` (= brand-foreground) | on fill **6.47:1 / 4.78:1** |

Destructive is **only** for irreversible actions inside a confirm dialog, or the danger menu item —
never for "remove filter", never for negative amounts (that is `--negative`).

### 2.6 Chart ramp — sequential, hue 156

Single hue, sequential. **Not categorical** (D7/§9): five green tints cannot label five categories.

| Token | Light | Dark | vs base |
|---|---|---|---|
| `--chart-1` | `oklch(0.52 0.10 156)` `#2e7a50` | `oklch(0.72 0.11 156)` `#66b987` | 5.23 / 8.08 |
| `--chart-2` | `oklch(0.60 0.095 156)` `#4c9168` | `oklch(0.64 0.10 156)` `#559e72` | 3.78 / 5.95 |
| `--chart-3` | `oklch(0.68 0.085 156)` `#6ba882` | `oklch(0.56 0.09 156)` `#44845e` | 2.78 / 4.30 |
| `--chart-4` | `oklch(0.78 0.06 156)` `#99c3a8` | `oklch(0.46 0.06 156)` `#3b624a` | 1.96 / 2.77 |
| `--chart-5` | `oklch(0.90 0.03 156)` `#cfe4d6` | `oklch(0.36 0.035 156)` `#2e4335` | 1.34 / 1.80 |

**Contrast rule:** steps **1–2** may be used as lines/thin marks in light (≥3:1) and **1–3** in dark;
steps 3–5 are **fills and gradients only** (area fill, heat scale, faint bands). Never a 1px line in
step 4–5.

| Token | Value | Use |
|---|---|---|
| `--chart-positive` / `--chart-negative` | `= --positive` / `= --negative` | two-series comparisons |
| `--chart-grid` | `= border-kumo-hairline` | gridlines (never dashed) |
| `--chart-axis` | `= text-kumo-subtle` | tick labels, 12px, `tabular-nums` |

### 2.7 Category palette (D8) — final 18 seed colors

**Rule:** hue ≥ 30° from 156° unless `C < 0.05` (near-neutral). Distinct **within** each type, and
since the three types are listed together (settings, mutations), also distinct across types.
≥3:1 against the card in **both** themes.

#### The per-mode mark rule (needed to satisfy "≥3:1 in light **and** dark")

A single hex cannot be ≥3:1 against both a light card (`L≈0.97`) and a dark card (`L≈0.28`) — the
required luminances are mutually exclusive. So `categories.color` is a **canonical anchor** (hue,
chroma, relative lightness) and the render color is derived per mode:

```
mark(light) = oklch(clamp(L − 0.16), min(C, maxChroma), H)
mark(dark)  = oklch(clamp(L + 0.12), min(C, maxChroma), H)
```

`L` is the stored color's OKLCH lightness. Implemented once in `lib/category-color.ts`
(Phase 2/3) and used by chips, table dots and chart slices — **never** re-derived per component.
Stored colors alternate **two tones** (`L 0.58` deep, `L 0.72` bright) so that hue-adjacent
categories are also separated by lightness.

| # | Category | Type | Stored (DB) | OKLCH | Δh from 156 | Mark light | Mark dark | vs card L / D |
|---|---|---|---|---|---|---|---|---|
| 1 | Healthcare | expense | `#f1779f` | `0.72 0.155 1` | 155° | `#b9456f` | `#ffb1c7` | 4.65 / 8.60 |
| 2 | Rent | expense | `#c54c53` | `0.58 0.155 20` | 136° | `#8e1427` | `#ef7276` | 8.44 / 5.11 |
| 3 | Transportation | expense | `#f47e57` | `0.72 0.155 39` | 117° | `#bc4c24` | `#ffb69f` | 4.59 / 8.66 |
| 4 | Gift | income | `#b1641a` | `0.58 0.128 58` | 98° | `#753c00` | `#d98945` | 8.01 / 5.30 |
| 5 | Other Expense | expense | `#867f79` | `0.60 0.012 63` | n/a (C<0.05) | `#58514c` | `#aba39d` | 7.14 / 5.88 |
| 6 | Other Income | income | `#9e9791` | `0.68 0.012 63` | n/a (C<0.05) | `#6e6862` | `#c4bcb6` | 5.04 / 7.80 |
| 7 | Dining Out | expense | `#d59728` | `0.72 0.139 77` | 79° | `#9b6900` | `#fdbd57` | 4.36 / 8.76 |
| 8 | Education | expense | `#8e791b` | `0.58 0.110 96` | 60° | `#5b4c00` | `#b39e47` | 7.77 / 5.50 |
| 9 | Groceries | expense | `#a2af28` | `0.72 0.151 115` | 41° | `#737c00` | `#c7d657` | 4.17 / 9.17 |
| 10 | Cash on Hand | starting balance | `#208c85` | `0.58 0.093 188` | 32° | `#005a55` | `#4fb1aa` | 7.42 / 5.71 |
| 11 | Salary | income | `#2eb9c6` | `0.72 0.113 205` | 49° | `#00858f` | `#60e0ed` | 4.05 / 9.31 |
| 12 | Savings | starting balance | `#1e83b8` | `0.58 0.119 238` | 82° | `#00537a` | `#4ca8df` | 7.64 / 5.55 |
| 13 | Freelance | income | `#50abf8` | `0.72 0.142 247` | 91° | `#0f79c2` | `#9ed0ff` | 4.25 / 8.99 |
| 14 | Utilities | expense | `#4f74d5` | `0.58 0.154 266` | 110° | `#2543a0` | `#719afe` | 8.06 / 5.40 |
| 15 | Investments | income | `#9c97f8` | `0.72 0.139 285` | 129° | `#6d66c2` | `#c4c4ff` | 4.45 / 8.83 |
| 16 | Shopping | expense | `#8f5fc4` | `0.58 0.155 304` | 148° | `#612f90` | `#b484ec` | 8.31 / 5.18 |
| 17 | Travel | expense | `#d281dc` | `0.72 0.154 323` | 167° | `#9e50a8` | `#f6abff` | 4.62 / 8.48 |
| 18 | Entertainment | expense | `#b54f94` | `0.58 0.155 342` | 174° | `#801c64` | `#de74ba` | 8.49 / 5.09 |

Verification: hue rule **pass** (0 violations); min mark contrast vs card **4.05:1**; min vs canvas
**3.52:1** (Salary, light); the 5 hues the old palette had to move (Salary 6.5°, Groceries 6.4°, Cash on Hand 6.4°,
Healthcare 26.5°, Education 25.2° from brand) are all ≥30° now; Transportation/Gift stay in the
orange/amber family per the issue (39° and 58°, nudged 9°/12° from the old values).

#### Distinctness, and what colour-blindness actually costs

OKLCH ΔE (Machado 2009, severity 1.0, applied in linear RGB; simulated in both deuteranopia and
protanopia):

| Type | n | min ΔE normal vision | min ΔE deuteranopia | min ΔE protanopia | pairs < 0.08 under CVD |
|---|---|---|---|---|---|
| expense | 11 | **0.096** (Transportation / Dining Out) | 0.006 | 0.039 | 8 / 55 |
| income | 5 | **0.091** (Freelance / Investments) | 0.005 | 0.034 | 1 / 10 |
| starting_balance | 2 | **0.092** (Cash on Hand / Savings) | 0.089 | 0.088 | 0 / 1 |

Closest cross-type pairs (all types are listed together): Savings/Utilities 0.075, Gift/Education
0.078, Other Expense/Other Income 0.080, Rent/Gift 0.096.

**No 10+ colour categorical palette survives red-green CVD at ΔE ≥ 0.08** — this is a hard limit,
not a palette defect. The contract therefore makes colour non-load-bearing (this is the same rule as
#29):

1. Every category mark is rendered **with its name** (chip label, legend entry, table column).
2. Breakdown charts show **top 6 categories + "Other"**, never all 11 at once.
3. Legends list categories in the fixed order of the table above (stable, not by value).
4. A category never relies on colour to convey good/bad — that is positive/negative's job.

#### Old → new

| Category | Old | Why it moves | New |
|---|---|---|---|
| Salary | `#10b981` (162.5°) | 6.5° from brand | `#2eb9c6` |
| Groceries | `#22c55e` (149.6°) | 6.4° from brand | `#a2af28` |
| Cash on Hand | `#22c55e` (149.6°) | 6.4° from brand | `#208c85` |
| Healthcare | `#14b8a6` (182.5°) | 26.5° — fails the 30° rule | `#f1779f` |
| Education | `#84cc16` (130.8°) | 25.2° — fails the 30° rule | `#8e791b` |
| Rent | `#ef4444` | contrast 3.45:1 light / **3.88** dark was under 4.5 as text | `#c54c53` |
| Utilities | `#3b82f6` | retuned to the tone scale | `#4f74d5` |
| Transportation | `#f97316` | keeps orange family (117°), lower chroma | `#f47e57` |
| Entertainment | `#ec4899` | retuned | `#b54f94` |
| Shopping | `#a855f7` | retuned | `#8f5fc4` |
| Dining Out | `#facc15` | 1.40:1 on the light card → unusable | `#d59728` |
| Travel | `#6366f1` | retuned | `#d281dc` |
| Other Expense | `#71717a` | neutral kept, tone split from Other Income | `#867f79` |
| Freelance | `#0ea5e9` | retuned | `#50abf8` |
| Investments | `#8b5cf6` | retuned | `#9c97f8` |
| Gift | `#f59e0b` | keeps amber family (98°) | `#b1641a` |
| Other Income | `#06b6d4` | now neutral (it is the catch-all) | `#9e9791` |
| Savings | `#0ea5e9` | was identical to Freelance | `#1e83b8` |

Old palette for reference: 10 of 18 were below 3:1 on the light card (worst: Dining Out **1.40:1**,
Education 1.81:1). The new palette has none.

**Rollout:** update `packages/db/src/seed.ts` **and** add a data migration that only rewrites rows
still holding the old default hex for that name — user-picked colors are never touched (Phase 2).

---

## 3. Spacing

Ground truth from today's pages: `gap-2` (51 uses), `gap-4` (23), `gap-1.5` (19), `space-y-2` (24),
`space-y-4` (10), `space-y-6` (5). The scale below is those values, named and made mandatory.

| Step | Rem | Used for |
|---|---|---|
| `space-1` | 4px | icon↔icon, chip padding (`px-1.5`) |
| `space-1.5` | 6px | **icon ↔ label inside a control**; label → input |
| `space-2` | 8px | **inline gap**: buttons/actions in a row, table cell padding-y |
| `space-3` | 12px | control padding-x (`px-3`), table cell padding-x |
| `space-4` | 16px | **field → field**; compact card padding |
| `space-6` | 24px | **section → section**; default card padding; page-header → content |
| `space-8` | 32px | page top/bottom padding ≥md |
| `space-12` | 48px | page top padding on `lg` and up |

Anything not on this list (e.g. `gap-5`, `mt-7`, `space-y-3`) is a review failure unless it is a
one-off optical fix recorded here.

### Page container (ONE recipe)

`PageContainer` — `mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8`.
Mobile bottom-nav clearance is applied by the authenticated layout
(`pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0`), so migrated **and**
not-yet-migrated pages get it.

| Breakpoint | Padding-x | Padding-y | Max width |
|---|---|---|---|
| `<sm` (<640) | 16px | 24px | 100% |
| `sm`–`md` | 24px | 24px | 100% |
| `lg`+ | 32px | 32px | 1280px |

`max-w-7xl` (1280px) because Tailwind's `container` already resolves to 1280px at the 1440px design
width — the ceiling simply stops ultrawide pages from stretching. Narrow content (settings, forms,
auth) is constrained **inside** the container with `max-w-4xl` / `max-w-md`, never with a second page
container. Breakdown pages use the same container (their old `py-3` is replaced by `py-6`).

---

## 4. Density & sizing

kumo's control heights are the contract (D3). One exception only.

| Name | Height | Token/class | Where |
|---|---|---|---|
| `xs` | 20px | `h-5` | buttons/badges inside a table row or chip |
| `sm` | 26px | `h-6.5` | **only** dense table rows and filter toolbars |
| `base` | 36px | `h-9` | **default** for every control in the app |
| `lg` | 40px | `h-10` | **never in-app** except the auth CTA (login/signup submit) |

- Touch targets: minimum **44×44px** for anything tappable on `<md`, even when the visual control is
  36px (pad the hit area, don't grow the button).
- Sidebar/nav rows: 36px (`h-9`), 8px horizontal inset.
- Table rows: 40px default (`py-2` + 14px text), 32px in "dense" toolbars (`sm` controls).
- Icons (Phosphor): **16px in controls** (`size={16}`), **20px in headers, nav and empty states**,
  weight `regular`, `fill` only for the active nav item. Icon-only controls always carry `aria-label`.

---

## 5. Typography

Font: `Google Sans Flex` (`--font-sans`). kumo's type scale is adopted as-is (D9) — **our app's text
gets 1–2px smaller in Phase 2, on purpose**:

| kumo token | Size | Line height | Replaces Tailwind |
|---|---|---|---|
| `--text-xs` | 12px | 1.33 | 12px (same) |
| `--text-sm` | **13px** | 1.18 | 14px |
| `--text-base` | **14px** | 1.5 | 16px |
| `--text-lg` | **16px** | 1.5 | 18px |

Roles (Tailwind classes above `lg` come from Tailwind's scale; kumo does not define them):

| Role | Classes |
|---|---|
| Page title | `text-xl sm:text-2xl font-semibold tracking-tight` |
| Page description | `text-sm text-kumo-subtle` (never below full opacity) |
| Section title | `text-lg font-semibold` |
| Card title | `text-base font-semibold` |
| Metric value | `text-2xl font-semibold tabular-nums` |
| Body / table cell | `text-base` (14px) |
| Caption, axis, badge | `text-sm` / `text-xs` |
| Field label | `text-sm font-medium` |
| Helper / error | `text-xs` |
| **Money, everywhere** | `+ tabular-nums`. No exceptions. |

**Form-control exception (D9):** below `md`, `input`, `textarea`, `select`, combobox and date inputs
render at **16px** — iOS Safari auto-zooms on focus below 16px. Implemented as one rule in the design
layer, not per component:

```css
@media (max-width: 767px) {
	[data-kumo-component="Input"],
	[data-kumo-component="Select"],
	[data-kumo-component="Combobox"],
	input,
	textarea,
	select { font-size: 1rem; }
}
```

Page-title, metric and money sizes stay above `sm` regardless of density — hierarchy beats compactness.

---

## 6. Radius & elevation

`--radius: 0.75rem` (12px) → `sm 8` · `md 10` · `lg 12` · `xl 16`. kumo's class choices are the
contract; do not re-pick per component.

| Element | Radius | Elevation |
|---|---|---|
| Card / LayerCard | `rounded-xl` (16) | hairline border, **no shadow** |
| Popover, dropdown, tooltip | `rounded-lg` (12) | `shadow-lg` + `ring-kumo-line` |
| Dialog ≥md | `rounded-xl` (16) | `shadow-lg` |
| Bottom sheet <md | `rounded-t-xl` | `shadow-lg` |
| Input, select (base) | `rounded-lg` (12) | `shadow-xs` |
| Button base/lg | `rounded-lg` (12) | `shadow-xs` |
| Button sm / xs | `rounded-md` (10) / `rounded-sm` (8) | `shadow-xs` |
| Badge / chip | `rounded-full` | none |
| Table shell | `rounded-xl`, header sticky | border only |

Shadows are **only** for layers that float above content. A card with a shadow is a bug.

---

## 7. Components

### 7.1 Page header

```
<PageHeader title description actions />
```

One per route, first child of `PageContainer`: title (§5 page title), optional description
(`text-sm text-kumo-subtle`), `actions` right-aligned on `md+` and stacked below the title on
`<md`. **One primary CTA per view** — secondary controls (filters, currency, view toggles) are
`secondary`/`ghost`. Header → content gap `space-6`.

### 7.2 Surfaces

| Element | Recipe |
|---|---|
| Card | kumo `LayerCard`: `rounded-xl border-kumo-hairline bg-kumo-base`, no shadow |
| Card header | title `text-base font-semibold`, optional description `text-sm text-kumo-subtle` |
| Inset panel | `rounded-lg bg-kumo-recessed` (no border) |
| Table shell | `rounded-xl border-kumo-hairline bg-kumo-base`, header row `border-b border-kumo-hairline` |

### 7.3 Buttons

| Intent | Variant | Notes |
|---|---|---|
| Primary CTA | `primary` | brand fill, label `--brand-foreground`; **one per view**, in the page header |
| Secondary | `secondary` | filters, currency select, view toggles, dialog cancel |
| Tertiary | `ghost` | icon-only actions, inline row actions |
| Outline | `outline` | stands next to a primary of equal weight |
| Destructive | `destructive` | only inside a confirm dialog |
| Secondary destructive | `secondary-destructive` | "delete" row/menu action |

Rules: no icon-only button without `aria-label`; `loading` replaces the icon with a spinner and
disables the control; `title` (tooltip) only for icon-only or truncated actions.

### 7.4 Forms

| Element | Spec |
|---|---|
| Label | above the control, `text-sm font-medium`, gap to control `space-1.5` (6px) |
| Control | base 36px, `rounded-lg`, `border-kumo-line`, `bg-kumo-control`; 16px text `<md` |
| Helper text | `text-xs text-kumo-subtle`, `space-1` under the control |
| Error text | `text-xs text-kumo-danger`, replaces helper; control gets `aria-invalid` + `ring-kumo-danger` |
| Field spacing | `space-y-4` between fields, `space-y-6` between sections |
| Money input | `text-right tabular-nums`, `inputmode="decimal"`; currency suffix/prefix is not part of the value |
| Required | asterisk in the label + `aria-required`, never colour-only |
| Submit | full-width `lg` only on auth screens; `base` elsewhere, aligned right with the form's actions |

### 7.5 Tables

| Element | Spec |
|---|---|
| Row height | 40px default (`px-3 py-2`); 32px dense variant with `sm` controls |
| Header | `text-sm font-medium text-kumo-subtle`, sticky, `border-b border-kumo-hairline`, no uppercase tracking |
| Row separation | kumo's zebra (`even:bg-kumo-elevated`), no per-row borders |
| Numeric cells | right-aligned, `tabular-nums`; amounts carry sign + colour + arrow + label (#29) |
| Text cells | left-aligned, truncate with tooltip only when the value is non-essential |
| Selection | checkbox column first, header checkbox for select-all; selected row `bg-kumo-tint` |
| Empty state | in-table, `EmptyState` (§7.8), min-height 12rem, never a blank grid |
| Pagination | below the table: "N of M rows" left (`text-sm text-kumo-subtle`), prev/next + page size right; page state stays in the URL |
| Overflow | rows scroll **inside** the shell (`overflow-x-auto`); the page never scrolls horizontally |

### 7.6 Dialogs & sheets (D11)

All modals go through `ResponsiveDialog`, which is a thin wrapper over kumo **`LayerDialog`**:
centered dialog at `≥md`, swipeable bottom sheet at `<md` (drag handle, safe-area padding,
Esc/overlay close, focus trap). Never build a second sheet, never add `vaul`.

| Size | LayerDialog width (`≥md`) | Use |
|---|---|---|
| `sm` | 448px | confirmations, single field |
| `base` | 576px | **default**: add/edit transaction, category |
| `lg` | 672px | forms with 2 columns, breakdown drill-in |
| `xl` | 768px | import/preview tables |

Footer: **dismiss/secondary left, primary right**. Destructive confirm pattern: title is the question
("Delete this expense?"), body states what is irreversibly lost, primary is `destructive` and labelled
with the verb ("Delete"), dismiss label is "Cancel" (a real cancel outcome), Esc/overlay dismiss
allowed, focus starts on the dismiss button.

### 7.7 Toasts

kumo `Toasty` (via the app-level provider). Bottom-right `≥md`; bottom-center `<md`, above the bottom
nav with safe-area padding. Max 3 visible, newest on top, auto-dismiss 5s (8s for errors), dismiss
button on every toast. Copy: title = the result ("Expense saved"), description = optional detail,
never an apology ("Oops…" is a bug).

### 7.8 Empty / loading / error

| State | Recipe |
|---|---|
| Empty | `EmptyState`: 20px Phosphor icon in `text-kumo-subtle`, title `text-base font-medium`, one line of `text-sm text-kumo-subtle`, at most one action. Used for every data region (dashboard cards, tables, charts). |
| Loading | skeleton (`kumo` shimmer) with the **shape of the final content**: card blocks `rounded-lg`, table rows 40px, chart area with its real height. No spinners for content; spinners only inside buttons. |
| Error | inline `Banner variant="danger"` with one sentence + a "Retry" action. Never a bare toast for a failed page load; never a blank screen. |

### 7.8 Tooltips

kumo `Tooltip`, 300ms open delay, `side="top"` by default. Only for: icon-only controls, truncated
labels, and disabled controls explaining why. Never essential information, never on mobile-only
affordances.

---

## 8. Navigation

### 8.1 Desktop sidebar (`≥md`)

| Property | Spec |
|---|---|
| Width | 256px (`w-64`), collapsible to an icon rail (57px, kumo's default — its row padding and clip are tuned for it; don't narrow it) — icon rail is the only collapsed state |
| Surface | `bg-kumo-canvas` with `border-r border-kumo-hairline`; nav items on `bg-kumo-base` hover → `bg-kumo-tint` |
| Item | 36px tall, `rounded-lg`, icon 20px + label `text-base`, gap `space-2` |
| Active | `bg-kumo-tint` + `text-kumo-strong` + **fill** icon; a 2px brand bar is allowed only if the tint is removed |
| Groups | (Dashboard · Income · Expense · Mutations · Assets · Starting Balance) then (Settings · Help) |
| Footer | theme toggle, sign out; user block above them |
| Brand | logo 28px + wordmark (§11) at the top, 16px inset |

### 8.2 Mobile bottom nav (`<md`) — exactly D4

`Dashboard · Expense · [+ Add] · Income · More`

| Property | Spec |
|---|---|
| Height | 56px + `env(safe-area-inset-bottom)`; background `bg-kumo-base`, `border-t border-kumo-hairline`, backdrop blur off |
| Slots | 5, equal width, icon 20px + label `text-xs` (11–12px), stacked with `space-1` |
| `+ Add` | 48px brand-filled circle (`bg-kumo-brand`, `text-kumo-foreground`), raised 8px above the bar; opens the add-transaction sheet |
| `More` | opens a sheet: Mutations · Assets · Starting Balance · Settings · Help |
| Active | `text-kumo-brand` + fill icon; inactive `text-kumo-subtle` + regular |
| Touch target | ≥44×44px per slot, incl. the raised `+` (48px) |
| Content clearance | pages get `pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]` below `md` |
| Visibility | hidden `≥md`; sidebar trigger hidden `<md`; sidebar itself never rendered `<md` |

Routing uses TanStack Router `Link` active state — no manual path comparisons.

---

## 9. Motion

| Interaction | Duration / easing |
|---|---|
| Hover, press, focus ring | **100ms** `ease-out` (kumo's `--default-transition-duration`) |
| Dropdown / popover / tooltip | enter 150ms `ease-out`, exit 100ms `ease-in` |
| Dialog ≥md | 200ms `ease-out`, opacity + `scale 0.95 → 1` |
| Bottom sheet <md | 450ms `cubic-bezier(0.32, 0.72, 0, 1)` in; dismiss duration scales with swipe strength (kumo/Base UI default) |
| Toast | 400ms spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`) |
| Theme switch | **no transition** (`disableTransitionOnChange`) |
| Charts | no entrance animation beyond ECharts' fade; no looping decoration |

`prefers-reduced-motion: reduce` → no transforms, no spring, opacity-only where a state change must
still be perceivable (`motion-reduce:transition-none`, `motion-reduce:animate-none`).

---

## 10. Charts

Rendering: **kumo Charts (ECharts)**. `Chart` takes the `echarts` instance as a prop, so the import
lives in the chart module — and every chart stays behind `React.lazy` (#48). One adapter
`lib/chart-theme.ts` maps contract tokens → ECharts options and re-themes on mode change.

| Rule | Detail |
|---|---|
| Single series | `--chart-1` line, area fill = `--chart-1` at 18% → transparent; steps 4–5 only for fainter bands |
| Two series (income vs expense) | `--chart-positive` / `--chart-negative`; legend required (≥2 series) |
| Breakdown (pie/category) | **`categories.color`** per datum (#19), through the per-mode `mark()` of §2.7; no hardcoded palette |
| Fallback colors | if a datum has no colour, cycle `--chart-1..5` — `--chart-6`/`--chart-8` **do not exist** and must be removed (Phase 5) |
| Grid / axis | `--chart-grid` horizontal lines only, `--chart-axis` labels at 12px `tabular-nums`, no axis lines, no dashes |
| Tooltip | kumo popover surface (`bg-kumo-base`, `border-kumo-line`, `shadow-lg`), value `tabular-nums`, series name first |
| Legends | only ≥2 series, always shows the category name (never colour alone) |
| Numbers | axis + tooltip values use the same currency formatting as tables; `tabular-nums` |
| Empty | chart card shows `EmptyState`, not an empty canvas |
| Motion | respect `prefers-reduced-motion`; no animation on data update beyond ECharts defaults |

### 10.1 Implementation recipe

**One adapter, one import, one lazy boundary.**

| Piece | Rule |
|---|---|
| Theme | `lib/chart-theme.ts` is the only place that touches colours. It reads the CSS vars (`--chart-1..5`, `--positive`, `--negative`, `--color-kumo-hairline`, `--text-color-kumo-subtle`, `--color-kumo-base`), resolves `light-dark()` through a probe element, and normalises the result to `rgb()` through a 1×1 canvas — ECharts' own parser does not understand `oklch()`/`light-dark()`. Re-read on every mode change (`useChartTheme()`), never cached across themes. |
| Tokens | `baseChartOption(theme)` (typography, grid, tooltip surface) + `axisStyle(theme)` (no axis lines, contract grid, muted ticks). Charts pass their own `grid`, `xAxis`, `yAxis`, `series`. No hex, no palette colour, no `var(--…)` reaches the ECharts option. |
| Import | `components/charts/echarts.ts` registers only what the six charts use (`Bar`, `Line`, `Pie`, `Grid`, `Tooltip`, `CanvasRenderer`) and is imported **only** from modules behind `React.lazy`. Entry and `login` chunks must contain zero `zrender` matches. |
| Update | `optionUpdateBehavior={REPLACE_OPTION}` (`notMerge: true`): every render rebuilds the whole option, so merging leaves stale axes behind. Data must be memoised on the query result — a fresh array per render means a `setOption` per render. |
| Colour | Category series take `categoryMark(categories.color, mode)` and pass it through `toChartColor()` (#19). The fallback is `theme.palette[index % 5]`; there is no other palette. |
| Numbers | Axes: `formatCompactMoney` (`$1.2k`, `$3.4M`). Tooltips and bar labels: the app's `formatCurrency`. Both `tabular-nums` on screen, money only ever via the currency context. |
| Legend | `ChartLegend` (React, `components/charts/chart-legend.tsx`), rendered only for ≥2 series, always with the name. Never ECharts' canvas legend: it is unreachable for screen readers and unselectable. |
| A11y | Every chart is wrapped in `role="img"` + an `aria-label` that states what it shows **and** its totals/series. |
| Motion | `animation: theme.animated` (false under `prefers-reduced-motion`). |

**ECharts patterns that bite** (found while porting, all fixed here — do not reintroduce):

1. `label.offset` silently breaks label layout on `bar` series: every label collapses to the origin. Use `label.padding` for the gap instead.
2. `xAxis: { show: false }` also disables *series label layout* on a horizontal bar chart. Hide the decorations (`axisLabel/axisLine/axisTick/splitLine: { show: false }`) but keep the axis rendered.
3. `yAxis.inverse: true` puts series labels on the wrong row. Reverse the category data instead.
4. A bar's value label at `position: "right"` is clipped when the bar reaches the axis max. Give the value axis ~50 % headroom (`max = ceil(max × 1.5)`) so the label always fits inside the canvas, at 375 px too.
5. `smooth: true` overshoots below zero between two zero points. Use `smoothMonotone: "x"` **and** `min: 0` on non-negative series.
6. Axis label density must be deliberate: 12 months at 375 px get `interval: 1` (every other month) rather than ECharts' silent auto-hiding.

---

## 11. Branding

| Item | Spec |
|---|---|
| Mark | the coin logo (`apps/web/public/logo.png`), never recoloured, never stretched, never on a busy photo |
| Min size | 20px (favicon) · 24px (inline) · 28px (sidebar) · 32px (auth) |
| Clear space | ≥ 0.5 × the mark's height on all sides |
| On light | logo on `bg-kumo-canvas`/`base` only; if it must sit on brand, use the light logo variant |
| On dark | same asset (the coin reads on `#0f0f0f`); no glow, no shadow, no ring |
| Wordmark | "Moneta", `Google Sans Flex` 600, `tracking-tight`, 16px in the sidebar / 20px on auth, `text-kumo-strong`; gap to mark `space-2`; never lowercase, never letter-spaced |
| Component | `components/brand/logo.tsx` is the only lockup: mark + wordmark, `size="sm"` (sidebar, 28 px) / `size="lg"` (auth, 32 px), `markOnly` for the collapsed rail. The image is `alt=""` because the wordmark carries the name. |
| Source | `apps/web/public/logo.png` (409×409). The PWA pipeline upscales it to 512 px + maskable — acceptable today, a larger or SVG source is the fix if the store icons read soft. |
| Favicons (via the existing `vite-plugin-pwa` `pwaAssets` pipeline, D13) | `favicon.ico` (16+32), `favicon-16.png`, `favicon-32.png`, `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png` |
| Manifest | `name: "Moneta"`, `short_name: "Moneta"`, real description, `theme_color: #2e7a50` (brand fill, light), `background_color: #ffffff` |

---

## 12. Guardrails

Run in `apps/web/src` before every PR. Each must return **nothing** (chart files exempt only where
noted).

```bash
# 1. raw hexes in components (charts: allowed until Phase 5 removes them)
grep -rnE "#[0-9a-fA-F]{3,8}\b" apps/web/src --include=*.tsx | grep -v "components/ui/chart.tsx"

# 2. Tailwind palette colours instead of semantic tokens
grep -rnE "(text|bg|border|from|to|ring|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" \
  apps/web/src --include=*.tsx

# 3. dark: variants (kumo is data-mode + semantic tokens)
grep -rn "dark:" apps/web/src --include=*.tsx

# 4. lucide (Phosphor only)
grep -rn "lucide-react" apps/web/src

# 5. banned brand hexes / old palette
grep -rnE "#f6821f|#10b981|#22c55e|#14b8a6|#84cc16|#06b6d4" apps/web/src packages/db/src

# 6. gates
pnpm run check && pnpm run -F web check-types && pnpm run -F web build
```

Review checklist:

- [ ] Light **and** dark screenshots; 375 / 768 / 1440px
- [ ] No horizontal page scroll (tables scroll inside their shell)
- [ ] One primary CTA per view; brand never on a number
- [ ] Every P&L value: sign + arrow + label
- [ ] Every icon-only control has `aria-label`
- [ ] Every data region has empty / loading / error states
- [ ] 44px touch targets on `<md`; bottom-nav clearance on every page
- [ ] Charts still lazy; entry chunk size reported vs `main` (D12)
- [ ] No raw hex / palette colour / `dark:` / lucide in touched files

---

## 13. Transition state (what is deliberately not green yet)

| Item | Until |
|---|---|
| ✅ Warm neutrals — replaced by kumo's ramp in Phase 2 (`--background`→canvas, `--card`→base, `--muted`→tint, `--secondary`→recessed, `--border`→hairline) | done |
| ✅ `html, body` raw colours — body now paints `--background` | done |
| ✅ kumo type scale (D9) — live since Phase 2; form controls forced to 16px below `md` | done |
| ✅ Primitives, overlays, toasts and icons — every Button/Input/Select/Checkbox/Tabs/Card/Dropdown/Popover/Tooltip/modal/toast is kumo; Radix, `class-variance-authority`, `lucide-react`, `@tabler/icons-react` and `sonner` are gone from `apps/web` | done (Phase 3) |
| ✅ `--chart-6` / `--chart-8` in `chart-pie-categories.tsx` — replaced by the real `--chart-1…5` ramp | done |
| ✅ `summary-cards.tsx` palette literals — now `text-positive` / `text-negative` / `text-kumo-default` | done |
| `components/ui/{calendar,date-input,table,sidebar}.tsx` — kumo-styled composites that kumo does not ship (kept, no Radix); `calendar`/`date-input` are replaced by kumo `DatePicker` | Phase 5 |
| `components/ui/chart.tsx` — Recharts helpers | Phase 5 (kumo `Chart` + ECharts, #48) |
| `components/category-badge.tsx` cycles raw Tailwind palettes instead of `categories.color` | Phase 4 (payload already exists in the DB) |
| `doc-spec/chart-example.md` (violet ramp, Recharts) | Phase 5 rewrites/deletes |
| Render-blocking Google Fonts `@import` | separate perf PR |

---

## 13.1 `components/ui` inventory (Phase 3 result)

| File | Replacement | Status |
|---|---|---|
| `button.tsx`, `button-variants.ts` | kumo `Button` (`variant`/`size`/`shape`/`icon`/`loading`) + `buttonVariants()` for `<Link>` CTAs | deleted |
| `input.tsx` | kumo `Input` (built-in `label`/`description`/`error` Field wrapper) | deleted |
| `label.tsx` | kumo `Label` | deleted |
| `select.tsx` | kumo `Select` (single component + `items`) | deleted |
| `checkbox.tsx` | kumo `Checkbox` (`checked`/`indeterminate`/`onCheckedChange`) | deleted |
| `tabs.tsx` | kumo `Tabs` (data-driven `tabs` prop, no panels) | deleted |
| `card.tsx` | kumo `LayerCard` | deleted |
| `dropdown-menu.tsx` | kumo `DropdownMenu` compound | deleted |
| `popover.tsx` | kumo `Popover` compound | deleted |
| `tooltip.tsx` | kumo `Tooltip` (`content`, `asChild`) + `TooltipProvider` | deleted |
| `accordion.tsx` | custom, kumo-styled, on `@cloudflare/kumo/primitives/accordion` (Base UI) | deleted |
| `dialog.tsx` | `ResponsiveDialog` → kumo `LayerDialog` (D11) | deleted |
| `sheet.tsx` | removed — the mobile sidebar drawer is a `LayerDialog` too (one modal primitive) | deleted |
| `toast.tsx`, `toaster.tsx` | kumo `Toasty` + `useKumoToastManager` behind the existing `useToast()` adapter | deleted |
| `avatar.tsx`, `separator.tsx`, `skeleton.tsx` | custom, kumo-styled (`components/primitives/`) — kumo ships no equivalent | deleted |
| `table.tsx` | kumo `Table` | Phase 5 |
| `calendar.tsx`, `date-input.tsx` | kumo `DatePicker` | Phase 5 |
| `sidebar.tsx` | kumo `Sidebar` | Phase 5 |
| `chart.tsx` | kumo `Chart` + ECharts (#48) | Phase 5 |

---

## 14. kumo API gotchas (from the spike)

1. **Tooltip** — the trigger *is* a button. `<Tooltip content><Button/></Tooltip>` nests
   `<button>` in `<button>` and errors. Use `render={<Button/>}`.
2. **Table** — compound parts (`<Table.Head>` on the kumo import). Never shadow the shadcn names.
3. **Chart** — `echarts` is a prop, not an import inside kumo. Keep it in the lazy module.
4. **`@source` for pnpm** — the symlinked `node_modules/@cloudflare/kumo/dist` path scans 0 files;
   only the real `.pnpm/...` path works. Solved in Phase 2 by
   `apps/web/scripts/generate-kumo-source.mjs` (D10), which is gitignored, regenerated by
   `dev`/`build`/`postinstall`, and exits non-zero when kumo is missing or nothing matches.
5. **Dark mode** — kumo's dark tokens resolve through `color-scheme`, so `enableColorScheme` must
   stay on; overrides target both `:root.dark` and `:root[data-mode="dark"]` (D14).
6. **Single-child triggers are automatic** — `DropdownMenu.Trigger`, `Popover.Trigger` and `Tooltip`
   accept a kumo `Button` as their only child (they forward it as `render`); no `asChild` needed.
   Icon-only triggers must carry `aria-label` (kumo's types enforce it for `shape="square"`).
7. **`LayerDialog` shape is strict** — `Content` requires exactly one `Title` and one `Body` (an empty
   `Body` is fine); `Actions` renders the dismiss button itself, so a destructive confirm passes
   `dismissLabel="Cancel"` and one `Action`. Never branch the layout on viewport (D11).
8. **Portals beat `z-index: 50`** — only one modal primitive exists now (kumo `LayerDialog`), so
   Select/Dropdown/Popover open *inside* it without stacking hacks. Mixing a foreign dialog
   (the old Radix one, `z-50`) with a Base UI popup (`z-index: auto`) silently put the popup
   behind the dialog — one more reason D11 forbids a second modal implementation.
9. **Toasts** — mount `<Toasty>` once at the root (`routes/__root.tsx`) and call
   `useKumoToastManager().add({ title, description, variant })`; `hooks/use-toast.ts` is a thin
   adapter that keeps the old `toast({ title, description, variant })` signature for call sites.
