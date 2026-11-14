import { Banner, LayerCard } from "@cloudflare/kumo";
import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { EmptyState } from "@/components/layout";
import { cn } from "@/lib/utils";

type ChartCardHeight = "sm" | "base" | "lg" | "xl" | "auto";

/**
 * Chart canvases are not on the spacing scale; these are the only sizes.
 * `auto` is for charts that size themselves from their data (the breakdown
 * bars do, and touching that would be Phase 5).
 */
const BODY_HEIGHT: Record<ChartCardHeight, string> = {
	sm: "h-60",
	base: "h-70",
	lg: "h-75",
	xl: "h-100",
	auto: "",
};

type ChartCardProps = {
	title: string;
	description?: React.ReactNode;
	/** Card-level controls (year, category type, series toggle). */
	actions?: React.ReactNode;
	/** Period/range controls, shown above the plot and kept in every state. */
	toolbar?: React.ReactNode;
	height?: ChartCardHeight;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	/** Set when the query succeeded but has nothing to plot. */
	isEmpty?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	emptyAction?: React.ReactNode;
	/** Layout-only classes on the chart body. */
	bodyClassName?: string;
	className?: string;
	children?: React.ReactNode;
};

/**
 * Card chrome and states for every chart in the app (docs/design.md §7.2, §7.8,
 * §10). Charts are lazy-loaded, so they own their loading/empty/error states
 * rather than leaving a hole in the page, and the body keeps one fixed height
 * across all states so a late chart never shifts the layout (`auto` opts out
 * for charts that size themselves from their data).
 *
 * Chart *internals* stay untouched until Phase 5 — this component only owns the
 * surface around them.
 */
export function ChartCard({
	title,
	description,
	actions,
	toolbar,
	height = "base",
	isLoading = false,
	isError = false,
	onRetry,
	isEmpty = false,
	emptyTitle = "No data to display",
	emptyDescription,
	emptyAction,
	bodyClassName,
	className,
	children,
}: ChartCardProps): React.JSX.Element {
	return (
		<LayerCard
			className={cn(
				"flex h-full flex-col gap-0 rounded-xl p-0 shadow-none",
				className,
			)}
		>
			<div className="flex flex-wrap items-center justify-between gap-2 border-kumo-hairline border-b px-6 py-4">
				<div className="min-w-0 space-y-1">
					<h3 className="font-semibold text-base text-kumo-strong">{title}</h3>
					{description ? (
						<p className="text-kumo-subtle text-sm">{description}</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex flex-wrap items-center gap-2">{actions}</div>
				) : null}
			</div>

			{toolbar ? (
				<div className="border-kumo-hairline border-b px-6 py-2">{toolbar}</div>
			) : null}

			<div className={cn("p-6", BODY_HEIGHT[height])}>
				{isLoading ? (
					<div className="h-full w-full animate-pulse rounded-lg bg-kumo-fill" />
				) : isError ? (
					<Banner
						variant="error"
						icon={<WarningCircleIcon size={16} />}
						title={`Could not load ${title.toLowerCase()}`}
						description="This chart's data did not load."
						action={
							onRetry ? (
								<Banner.Action
									variant="secondary"
									icon={<ArrowClockwiseIcon size={16} />}
									onClick={onRetry}
								>
									Retry
								</Banner.Action>
							) : undefined
						}
					/>
				) : isEmpty ? (
					<div className="flex h-full items-center justify-center">
						<EmptyState
							title={emptyTitle}
							description={emptyDescription}
							action={emptyAction}
						/>
					</div>
				) : (
					<div className={cn("h-full w-full", bodyClassName)}>{children}</div>
				)}
			</div>
		</LayerCard>
	);
}
