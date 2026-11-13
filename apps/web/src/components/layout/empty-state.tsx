import { Empty } from "@cloudflare/kumo/components/empty";
import type * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
	/** Decorative Phosphor icon at 20px (docs/design.md §7.8). */
	icon?: React.ReactNode;
	title: string;
	description?: string;
	/** At most one action. */
	action?: React.ReactNode;
	/** `sm` inside cards/tables, `base` for a whole page or empty section. */
	size?: "sm" | "base" | "lg";
	className?: string;
};

/**
 * The one empty state (docs/design.md §7.8). Every data region renders this
 * instead of a blank area — tables, chart cards, dashboards, lists.
 */
export function EmptyState({
	icon,
	title,
	description,
	action,
	size = "sm",
	className,
}: EmptyStateProps): React.JSX.Element {
	return (
		<div data-slot="empty-state" className={cn("w-full", className)}>
			<Empty
				icon={icon}
				title={title}
				description={description}
				contents={action}
				size={size}
			/>
		</div>
	);
}
