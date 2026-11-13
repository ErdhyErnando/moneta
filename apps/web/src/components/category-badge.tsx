import { Badge } from "@cloudflare/kumo";
import { useCategoryMark } from "@/lib/category-color";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
	name: string;
	/** `categories.color` anchor — the only source of category colour (#19). */
	color?: string;
	className?: string;
};

/**
 * A category mark. The colour comes from `categories.color` through the shared
 * `categoryMark` derivation (docs/design.md §2.7) and is only ever a dot: the
 * chip itself stays a neutral surface, so colour is never the sole carrier of
 * meaning and no stored anchor has to hold label contrast on its own.
 *
 * A missing or malformed anchor degrades to a neutral dot, never a crash (#19).
 */
export function CategoryBadge({
	name,
	color,
	className,
}: CategoryBadgeProps): React.JSX.Element {
	const mark = useCategoryMark(color);

	return (
		<Badge variant="outline" className={cn("gap-1.5", className)}>
			<span
				aria-hidden="true"
				className={cn(
					"size-2 shrink-0 rounded-full",
					mark ? undefined : "bg-kumo-fill",
				)}
				style={mark ? { backgroundColor: mark } : undefined}
			/>
			{name}
		</Badge>
	);
}
