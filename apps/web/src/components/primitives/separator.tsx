import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * kumo has no standalone separator; this is the kumo-styled equivalent
 * (docs/design.md §7.2 — separators are drawn with `--color-kumo-hairline`).
 * Renders a real `<hr>` so no ARIA role is needed.
 */
export function Separator({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<"hr"> & {
	orientation?: "horizontal" | "vertical";
}): React.JSX.Element {
	return (
		<hr
			data-slot="separator"
			aria-orientation={orientation}
			className={cn(
				"shrink-0 border-0 bg-kumo-hairline",
				orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
				className,
			)}
			{...props}
		/>
	);
}
