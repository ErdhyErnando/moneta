import * as React from "react";

/**
 * Height of a chart's container, measured from layout.
 *
 * kumo's `Chart` takes a pixel height, but our cards size their bodies from the
 * contract's fixed heights and put a legend/footer inside the same body — so the
 * canvas has to take whatever is left. Measuring beats a magic number: it stays
 * correct when the legend wraps to a second row or the card height changes.
 *
 * Implemented as a callback ref rather than `useEffect` + `useRef`: the first
 * measurement happens in the commit phase, so the chart never renders once at
 * height 0 and then jumps.
 */
export function useElementHeight<T extends HTMLElement>(): {
	ref: (node: T | null) => void;
	height: number;
} {
	const [height, setHeight] = React.useState(0);
	const observerRef = React.useRef<ResizeObserver | null>(null);

	const ref = React.useCallback((node: T | null) => {
		observerRef.current?.disconnect();
		observerRef.current = null;
		if (!node) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			setHeight(Math.round(entry.contentRect.height));
		});
		observer.observe(node);
		observerRef.current = observer;

		const initial = Math.round(node.getBoundingClientRect().height);
		if (initial > 0) setHeight(initial);
	}, []);

	return { ref, height };
}
