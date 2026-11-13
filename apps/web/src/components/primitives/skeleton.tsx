import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * kumo ships no skeleton primitive, so this is the contract's loading recipe
 * (docs/design.md §7.8): a shimmer block with the shape of the final content,
 * painted with kumo's fill token. Radius follows the thing it replaces.
 */
export function Skeleton({
	className,
	...props
}: React.ComponentProps<"div">): React.JSX.Element {
	return (
		<div
			data-slot="skeleton"
			aria-hidden="true"
			className={cn("animate-pulse rounded-lg bg-kumo-fill", className)}
			{...props}
		/>
	);
}
