import {
	DotsThreeCircle,
	Plus,
	SquaresFour,
	TrendDown,
	TrendUp,
} from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import type * as React from "react";
import { cn } from "@/lib/utils";

type NavItem = {
	label: string;
	to: string;
	icon: React.ReactNode;
	activeIcon: React.ReactNode;
	exact?: boolean;
};

const regular = { size: 20, weight: "regular" } as const;
const filled = { size: 20, weight: "fill" } as const;

const ITEMS: NavItem[] = [
	{
		label: "Dashboard",
		to: "/",
		icon: <SquaresFour {...regular} />,
		activeIcon: <SquaresFour {...filled} />,
		exact: true,
	},
	{
		label: "Expense",
		to: "/expense",
		icon: <TrendDown {...regular} />,
		activeIcon: <TrendDown {...filled} />,
	},
	{
		label: "Income",
		to: "/income",
		icon: <TrendUp {...regular} />,
		activeIcon: <TrendUp {...filled} />,
	},
];

const MORE_ACTIVE_TO = [
	"/mutations",
	"/assets",
	"/starting-balance",
	"/settings",
];

type BottomNavProps = {
	/** Opens the add-transaction sheet (lazy-loaded by the layout). */
	onAddTransaction: () => void;
	/** Opens the "More" sheet (lazy-loaded by the layout). */
	onMore: () => void;
};

/**
 * Mobile bottom navigation (decision D4, docs/design.md §8.2):
 * Dashboard · Expense · [+ Add] · Income · More. Visible below `md` only.
 *
 * - 56px bar + `env(safe-area-inset-bottom)`; every slot >= 44px.
 * - "+" is a 48px brand circle raised 8px above the bar.
 * - "More" and "+" open sheets owned by the layout, so this module stays
 *   light (no kumo dialog import in the first authenticated paint).
 */
export function BottomNav({
	onAddTransaction,
	onMore,
}: BottomNavProps): React.JSX.Element {
	const matchRoute = useMatchRoute();
	const isActive = (item: NavItem): boolean =>
		Boolean(
			matchRoute({
				to: item.to,
				fuzzy: item.exact ? false : undefined,
				pending: true,
			}),
		);
	const moreActive = MORE_ACTIVE_TO.some((to) =>
		Boolean(matchRoute({ to, pending: true })),
	);

	const item = (navItem: NavItem): React.JSX.Element => {
		const active = isActive(navItem);
		return (
			<Link
				to={navItem.to}
				aria-current={active ? "page" : undefined}
				className="flex min-h-11 flex-col items-center justify-center gap-1"
			>
				<span
					aria-hidden="true"
					className={cn(
						"grid size-6 place-items-center",
						active ? "text-kumo-brand" : "text-kumo-subtle",
					)}
				>
					{active ? navItem.activeIcon : navItem.icon}
				</span>
				<span
					className={cn(
						"text-[11px] leading-none",
						active ? "font-medium text-kumo-brand" : "text-kumo-subtle",
					)}
				>
					{navItem.label}
				</span>
			</Link>
		);
	};

	return (
		<nav
			data-slot="bottom-nav"
			aria-label="Primary"
			className="fixed inset-x-0 bottom-0 z-40 border-kumo-hairline border-t bg-kumo-base pb-[env(safe-area-inset-bottom)] md:hidden"
		>
			<ul className="mx-auto grid h-14 max-w-lg grid-cols-5 items-stretch">
				<li className="flex items-center justify-center">{item(ITEMS[0])}</li>
				<li className="flex items-center justify-center">{item(ITEMS[1])}</li>
				<li className="relative flex items-start justify-center">
					<button
						type="button"
						onClick={onAddTransaction}
						aria-label="Add transaction"
						className="-translate-y-2 grid size-12 place-items-center rounded-full bg-kumo-brand text-kumo-brand-foreground shadow-lg ring-4 ring-kumo-base transition-transform active:scale-95"
					>
						<Plus size={20} weight="bold" />
					</button>
				</li>
				<li className="flex items-center justify-center">{item(ITEMS[2])}</li>
				<li className="flex items-center justify-center">
					<button
						type="button"
						onClick={onMore}
						aria-label="More"
						className="flex min-h-11 flex-col items-center justify-center gap-1"
					>
						<span
							aria-hidden="true"
							className={cn(
								"grid size-6 place-items-center",
								moreActive ? "text-kumo-brand" : "text-kumo-subtle",
							)}
						>
							<DotsThreeCircle {...(moreActive ? filled : regular)} />
						</span>
						<span
							className={cn(
								"text-[11px] leading-none",
								moreActive ? "font-medium text-kumo-brand" : "text-kumo-subtle",
							)}
						>
							More
						</span>
					</button>
				</li>
			</ul>
		</nav>
	);
}
