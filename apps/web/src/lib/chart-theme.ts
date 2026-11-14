import { useMemo } from "react";
import { useCategoryColorMode } from "@/lib/category-color";

/**
 * Chart theme adapter (docs/design.md §10).
 *
 * ECharts draws on a canvas, so it cannot consume CSS custom properties — the
 * values have to be resolved to concrete sRGB colors first. This module does
 * that once per theme and hands every chart the same token set:
 *
 *   read the CSS var  →  resolve `light-dark()` through a probe element  →  read
 *   the painted pixel from a 1×1 canvas.
 *
 * Two steps because the tokens are heterogeneous: our own (`--chart-1`,
 * `--positive`) are `oklch()`, kumo's are `light-dark(...)` which only resolves
 * in a used value. `getComputedStyle` returns `oklch()` unchanged (canvas
 * accepts it but zrender's parser does not), so the canvas step is what makes
 * the value safe for ECharts.
 */

export type ChartMode = "light" | "dark";

export type ChartTheme = {
	mode: ChartMode;
	/** `--chart-1..5`, the sequential brand ramp (§2.6). Never categorical. */
	palette: string[];
	positive: string;
	negative: string;
	/** Gridline / axis tick colors. */
	grid: string;
	axis: string;
	/** Body text inside the canvas (labels, tooltip). */
	text: string;
	/** Popover surface for the tooltip. */
	surface: string;
	border: string;
	fontFamily: string;
	fontSize: number;
	/** False when the user asked for reduced motion. */
	animated: boolean;
};

const TOKENS = {
	palette: [
		"--color-chart-1",
		"--color-chart-2",
		"--color-chart-3",
		"--color-chart-4",
		"--color-chart-5",
	],
	positive: "--positive",
	negative: "--negative",
	grid: "--color-kumo-hairline",
	axis: "--text-color-kumo-subtle",
	text: "--text-color-kumo-default",
	surface: "--color-kumo-base",
	border: "--color-kumo-hairline",
} as const;

/** `oklch(...)` / `light-dark(...)` / `rgb(...)` → `rgba(r,g,b,a)` for canvas. */
function toRgba(value: string): string {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return value;
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = value;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
	return a === 255
		? `rgb(${r}, ${g}, ${b})`
		: `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

/**
 * Resolve a `--token` to a concrete color. Falls back to `transparent` (not a
 * hex) if the token is somehow missing: a chart that draws nothing is an
 * obvious bug, whereas an off-brand colour would ship silently.
 */
function resolveToken(name: string): string {
	if (typeof document === "undefined") return "rgba(0, 0, 0, 0)";
	const probe = document.createElement("span");
	probe.style.color = `var(${name})`;
	probe.style.position = "absolute";
	probe.style.pointerEvents = "none";
	probe.style.opacity = "0";
	document.body.appendChild(probe);
	const computed = getComputedStyle(probe).color;
	probe.remove();
	if (!computed) return "rgba(0, 0, 0, 0)";
	return toRgba(computed);
}

/**
 * Convert a CSS color a caller already has in hand — e.g. `categoryMark()`,
 * which returns `oklch()` — into something ECharts can draw. Non-colors are
 * passed through so a bad value fails the same way it would in CSS.
 */
export function toChartColor(color: string): string {
	return toRgba(color);
}

function prefersReducedMotion(): boolean {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function readChartTheme(mode: ChartMode): ChartTheme {
	const bodyFont =
		typeof document === "undefined"
			? "sans-serif"
			: getComputedStyle(document.body).fontFamily || "sans-serif";

	return {
		mode,
		palette: TOKENS.palette.map((token) => resolveToken(token)),
		positive: resolveToken(TOKENS.positive),
		negative: resolveToken(TOKENS.negative),
		grid: resolveToken(TOKENS.grid),
		axis: resolveToken(TOKENS.axis),
		text: resolveToken(TOKENS.text),
		surface: resolveToken(TOKENS.surface),
		border: resolveToken(TOKENS.border),
		fontFamily: bodyFont,
		fontSize: 12,
		animated: !prefersReducedMotion(),
	};
}

/**
 * The chart theme for the current app mode. Re-reads when the theme toggles,
 * because every value is resolved from the live DOM (§10: "re-theme on mode
 * change").
 */
export function useChartTheme(): ChartTheme {
	const mode = useCategoryColorMode();
	return useMemo(() => readChartTheme(mode), [mode]);
}

/* -------------------------------------------------------------------------- */
/* Numbers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Compact axis money: `$1.2k`, `$3.4M`. Axis labels must stay short so the
 * plot keeps its width, and they must not invent precision the data lacks.
 */
export function formatCompactMoney(
	value: number,
	symbol: string,
	locale = "en-US",
): string {
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	const format = (scaled: number, suffix: string) => {
		const text = new Intl.NumberFormat(locale, {
			maximumFractionDigits: Math.abs(scaled) < 10 ? 1 : 0,
		}).format(scaled);
		return `${sign}${symbol}${text}${suffix}`;
	};
	if (abs >= 1_000_000_000) return format(value / 1_000_000_000, "B");
	if (abs >= 1_000_000) return format(value / 1_000_000, "M");
	if (abs >= 1_000) return format(value / 1_000, "k");
	return `${sign}${symbol}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(abs)}`;
}

/* -------------------------------------------------------------------------- */
/* Shared option pieces                                                        */
/* -------------------------------------------------------------------------- */

export type TooltipRow = {
	label: string;
	value: string;
	/** Dot color; omitted for single-series charts (the title carries it). */
	color?: string;
};

const escapeHtml = (value: string): string =>
	value.replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			default:
				return "&#39;";
		}
	});

/**
 * Tooltip body. Rendered as HTML inside ECharts' DOM tooltip, using only theme
 * colors — series name first, value right-aligned and `tabular-nums`, on the
 * popover surface (§10).
 */
export function tooltipHtml(
	theme: ChartTheme,
	title: string | undefined,
	rows: TooltipRow[],
): string {
	const row = (item: TooltipRow) => `
		<div style="display:flex;align-items:center;gap:8px;margin-top:2px">
			${
				item.color
					? `<span style="width:8px;height:8px;border-radius:9999px;flex:none;background:${item.color}"></span>`
					: ""
			}
			<span style="flex:1;white-space:nowrap;color:${theme.axis}">${escapeHtml(item.label)}</span>
			<span style="font-variant-numeric:tabular-nums;font-weight:600;white-space:nowrap">${escapeHtml(item.value)}</span>
		</div>`;

	return `<div style="padding:8px 10px;font-family:${theme.fontFamily};font-size:${theme.fontSize}px;line-height:1.4;color:${theme.text};min-width:150px">
		${title ? `<div style="font-weight:600;margin-bottom:2px">${escapeHtml(title)}</div>` : ""}
		${rows.map(row).join("")}
	</div>`;
}

type BaseChartOption = {
	animation: boolean;
	textStyle: { fontFamily: string; fontSize: number; color: string };
	grid: {
		left: number;
		right: number;
		top: number;
		bottom: number;
		containLabel: boolean;
	};
	tooltip: {
		backgroundColor: string;
		borderColor: string;
		borderWidth: number;
		padding: number;
		textStyle: { color: string; fontFamily: string; fontSize: number };
		extraCssText: string;
	};
};

/** Base option every chart starts from: typography, grid, tooltip surface. */
export function baseChartOption(theme: ChartTheme): BaseChartOption {
	return {
		animation: theme.animated,
		textStyle: {
			fontFamily: theme.fontFamily,
			fontSize: theme.fontSize,
			color: theme.text,
		},
		grid: { left: 4, right: 12, top: 12, bottom: 4, containLabel: true },
		tooltip: {
			backgroundColor: theme.surface,
			borderColor: theme.border,
			borderWidth: 1,
			padding: 0,
			textStyle: {
				color: theme.text,
				fontFamily: theme.fontFamily,
				fontSize: theme.fontSize,
			},
			extraCssText:
				"border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden;",
		},
	};
}

type AxisStyle = {
	axisLine: { show: boolean };
	axisTick: { show: boolean };
	axisLabel: { color: string; fontSize: number };
	splitLine: { lineStyle: { color: string } };
};

/** Shared axis styling: no axis lines, gridlines from the contract, muted ticks. */
export function axisStyle(theme: ChartTheme): AxisStyle {
	return {
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { color: theme.axis, fontSize: theme.fontSize },
		splitLine: { lineStyle: { color: theme.grid } },
	};
}
