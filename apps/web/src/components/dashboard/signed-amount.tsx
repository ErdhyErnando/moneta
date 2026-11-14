import { ArrowDownRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SignedAmountProps = {
	amount: number;
	formatCurrency: (amount: number) => string;
	/** Only ever `positive` or `negative` — brand never colours a number (§2.4). */
	direction: "positive" | "negative";
	/** `metric` is the 24px card value, `inline` the 13px card footer. */
	size?: "metric" | "inline";
	className?: string;
};

const SIZES = {
	metric: "font-semibold text-2xl",
	inline: "font-medium text-sm",
} as const;

const ARROW = { size: 16, weight: "regular" } as const;

/**
 * A P&L value (docs/design.md §2.4): sign + arrow + colour, never colour alone.
 * The direction is also spelled out for screen readers, because a minus sign is
 * dropped by some screen readers and an arrow is invisible to all of them.
 */
export function SignedAmount({
	amount,
	formatCurrency,
	direction,
	size = "metric",
	className,
}: SignedAmountProps): React.JSX.Element {
	const isPositive = direction === "positive";
	const Arrow = isPositive ? ArrowUpRightIcon : ArrowDownRightIcon;

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 tabular-nums",
				SIZES[size],
				isPositive ? "text-positive" : "text-negative",
				className,
			)}
		>
			<Arrow {...ARROW} aria-hidden="true" className="shrink-0" />
			<span>
				<span aria-hidden="true">{isPositive ? "+" : "-"}</span>
				<span className="sr-only">
					{isPositive ? "increase of " : "decrease of "}
				</span>
				{formatCurrency(Math.abs(amount))}
			</span>
		</span>
	);
}
