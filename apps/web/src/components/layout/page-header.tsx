import type * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
	title: string;
	description?: string;
	/** At most one primary action plus secondary controls (docs/design.md §7.1). */
	actions?: React.ReactNode;
	className?: string;
};

/**
 * The one page header (docs/design.md §7.1): title, optional description and
 * right-aligned actions on md+, stacked below the title on mobile.
 */
export function PageHeader({
	title,
	description,
	actions,
	className,
}: PageHeaderProps): React.JSX.Element {
	return (
		<div
			data-slot="page-header"
			className={cn(
				"mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
				className,
			)}
		>
			<div className="min-w-0 space-y-1">
				<h1 className="font-semibold text-kumo-strong text-xl tracking-tight sm:text-2xl">
					{title}
				</h1>
				{description ? (
					<p className="text-kumo-subtle text-sm">{description}</p>
				) : null}
			</div>
			{actions ? (
				<div className="flex flex-wrap items-center gap-2 md:justify-end">
					{actions}
				</div>
			) : null}
		</div>
	);
}
