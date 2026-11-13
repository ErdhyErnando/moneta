import type * as React from "react";
import { cn } from "@/lib/utils";

type PageContainerWidth = "default" | "narrow";

type PageContainerProps = {
	children: React.ReactNode;
	/**
	 * `default` = `max-w-7xl` for data pages. `narrow` = `max-w-4xl` for settings,
	 * forms and auth. Never introduce a third page container (docs/design.md §3).
	 */
	width?: PageContainerWidth;
	className?: string;
};

const WIDTH_CLASSES: Record<PageContainerWidth, string> = {
	default: "max-w-7xl",
	narrow: "max-w-4xl",
};

/**
 * The one page container (docs/design.md §3): fills the viewport up to 1280px
 * and owns the page padding per breakpoint. Bottom-nav clearance is applied by
 * the authenticated layout, so every page (migrated or not) gets it.
 */
export function PageContainer({
	children,
	width = "default",
	className,
}: PageContainerProps): React.JSX.Element {
	return (
		<div
			data-slot="page-container"
			className={cn(
				"mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
				WIDTH_CLASSES[width],
				className,
			)}
		>
			{children}
		</div>
	);
}
