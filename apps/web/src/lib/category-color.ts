import { useSyncExternalStore } from "react";

/**
 * The one place a `categories.color` anchor becomes a renderable mark
 * (docs/design.md §2.7, #19).
 *
 * `categories.color` is a *canonical anchor* — hue, chroma and a relative
 * lightness — not a CSS value to paint with. A single hex cannot reach 3:1
 * against both a light card (`L≈0.97`) and a dark card (`L≈0.28`), so the render
 * colour is derived per mode:
 *
 *   mark(light) = oklch(clamp(L - 0.16), min(C, maxChroma), H)
 *   mark(dark)  = oklch(clamp(L + 0.12), min(C, maxChroma), H)
 *
 * Chips, table dots and chart slices all call `categoryMark` — never re-derive
 * it per component, or a category will drift between the list and the chart.
 */

export type CategoryColorMode = "light" | "dark";

/** Light marks sit `-0.16` OKLCH lightness from the stored anchor, dark `+0.12`. */
function lightnessShift(mode: CategoryColorMode): number {
	return mode === "dark" ? 0.12 : -0.16;
}

const HEX = /^#[0-9a-f]{6}$/i;

type Oklch = { lightness: number; chroma: number; hue: number };

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function srgbToLinear(channel: number): number {
	return channel <= 0.04045
		? channel / 12.92
		: ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
	return channel <= 0.0031308
		? 12.92 * channel
		: 1.055 * channel ** (1 / 2.4) - 0.055;
}

function hexToOklch(hex: string): Oklch | undefined {
	if (!HEX.test(hex)) {
		return undefined;
	}

	const red = srgbToLinear(Number.parseInt(hex.slice(1, 3), 16) / 255);
	const green = srgbToLinear(Number.parseInt(hex.slice(3, 5), 16) / 255);
	const blue = srgbToLinear(Number.parseInt(hex.slice(5, 7), 16) / 255);

	// linear sRGB → LMS → cube root → OKLab
	const long = Math.cbrt(
		0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
	);
	const medium = Math.cbrt(
		0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
	);
	const short = Math.cbrt(
		0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
	);

	const lightness =
		0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
	const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
	const b = 0.0259040371 * long + 0.7827717662 * medium - 0.8086758 * short;

	const hue = (Math.atan2(b, a) * 180) / Math.PI;
	return {
		lightness,
		chroma: Math.hypot(a, b),
		hue: hue < 0 ? hue + 360 : hue,
	};
}

function oklchToLinearSrgb(
	lightness: number,
	chroma: number,
	hue: number,
): [number, number, number] {
	const radians = (hue * Math.PI) / 180;
	const a = chroma * Math.cos(radians);
	const b = chroma * Math.sin(radians);

	const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

	return [
		4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
		-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
		-0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
	];
}

function isInGamut(lightness: number, chroma: number, hue: number): boolean {
	return oklchToLinearSrgb(lightness, chroma, hue).every(
		(channel) => channel >= -1e-6 && channel <= 1 + 1e-6,
	);
}

/**
 * OKLCH → sRGB hex, gamut-mapped by chroma reduction (CSS Color 4's approach)
 * instead of per-channel clipping, which would shift the hue and break the
 * contract's measured contrast values.
 */
function oklchToHex(lightness: number, chroma: number, hue: number): string {
	let mappedChroma = chroma;
	if (!isInGamut(lightness, chroma, hue)) {
		let low = 0;
		let high = chroma;
		for (let step = 0; step < 24; step += 1) {
			const middle = (low + high) / 2;
			if (isInGamut(lightness, middle, hue)) {
				low = middle;
			} else {
				high = middle;
			}
		}
		mappedChroma = low;
	}

	const toHexChannel = (channel: number): string =>
		Math.round(clamp01(linearToSrgb(clamp01(channel))) * 255)
			.toString(16)
			.padStart(2, "0");

	return `#${oklchToLinearSrgb(lightness, mappedChroma, hue).map(toHexChannel).join("")}`;
}

/**
 * Derives the per-mode mark colour for a stored `categories.color` anchor.
 * Returns `undefined` for a missing or malformed colour so callers can fall
 * back to a neutral token instead of crashing (#19).
 */
export function categoryMark(
	color: string | undefined,
	mode: CategoryColorMode,
): string | undefined {
	if (!color) {
		return undefined;
	}

	const anchor = hexToOklch(color);
	if (!anchor) {
		return undefined;
	}

	return oklchToHex(
		clamp01(anchor.lightness + lightnessShift(mode)),
		anchor.chroma,
		anchor.hue,
	);
}

const MODE_ATTRIBUTES = ["class", "data-mode"];

function subscribeToMode(onChange: () => void): () => void {
	if (typeof MutationObserver === "undefined") {
		return () => undefined;
	}

	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: MODE_ATTRIBUTES,
	});
	return () => observer.disconnect();
}

/** next-themes sets both signals (D14), so either one is authoritative. */
function readMode(): CategoryColorMode {
	if (typeof document === "undefined") {
		return "light";
	}

	const root = document.documentElement;
	return root.classList.contains("dark") ||
		root.getAttribute("data-mode") === "dark"
		? "dark"
		: "light";
}

/** The live theme mode, without a next-themes dependency. */
export function useCategoryColorMode(): CategoryColorMode {
	return useSyncExternalStore(subscribeToMode, readMode, () => "light");
}

/** `categoryMark` bound to the current theme mode. */
export function useCategoryMark(color: string | undefined): string | undefined {
	return categoryMark(color, useCategoryColorMode());
}
