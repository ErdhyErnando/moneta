import type * as React from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
	title?: string;
	description?: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
};

/**
 * A titled block inside a page (docs/design.md §3): section title `text-lg`,
 * `space-y-4` between the heading and the content, `space-y-6` between sections.
 */
export function Section({
	title,
	description,
	actions,
	children,
	className,
}: SectionProps): React.JSX.Element {
	return (
		<section data-slot="section" className={cn("space-y-4", className)}>
			{title || actions ? (
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 space-y-1">
						{title ? (
							<h2 className="font-semibold text-kumo-strong text-lg">
								{title}
							</h2>
						) : null}
						{description ? (
							<p className="text-kumo-subtle text-sm">{description}</p>
						) : null}
					</div>
					{actions ? (
						<div className="flex flex-wrap items-center gap-2">{actions}</div>
					) : null}
				</div>
			) : null}
			{children}
		</section>
	);
}
