import { cn } from "@/lib/utils";

export type ChartLegendItem = {
	label: string;
	color: string;
	/** Formatted value or share, shown after the label. */
	value?: string;
};

/**
 * Chart legend (docs/design.md §10): only rendered for ≥2 series, and it always
 * carries the name — colour is never the only signal (#29, §2.7).
 *
 * A React list rather than `legend` inside the ECharts option, so it is real
 * text: selectable, translatable and reachable by screen readers, which a
 * canvas legend is not.
 */
export function ChartLegend({
	items,
	className,
}: {
	items: ChartLegendItem[];
	className?: string;
}): React.JSX.Element | null {
	if (items.length < 2) return null;

	return (
		<ul
			className={cn(
				"flex flex-wrap items-center justify-center gap-x-4 gap-y-1",
				className,
			)}
		>
			{items.map((item) => (
				<li key={item.label} className="flex items-center gap-1.5 text-xs">
					<span
						aria-hidden="true"
						className="size-2 shrink-0 rounded-full"
						style={{ backgroundColor: item.color }}
					/>
					<span className="text-kumo-subtle">{item.label}</span>
					{item.value ? (
						<span className="font-medium tabular-nums">{item.value}</span>
					) : null}
				</li>
			))}
		</ul>
	);
}
