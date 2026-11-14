import { Sidebar } from "@cloudflare/kumo/components/sidebar";
import type { Icon } from "@phosphor-icons/react";
import { useRouterState } from "@tanstack/react-router";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type NavItem = {
	title: string;
	url: string;
	icon: Icon;
};

/** True when `pathname` is the item's route or a child of it. */
export function isNavItemActive(pathname: string, url: string): boolean {
	if (url === "#") return false;
	return url === "/"
		? pathname === "/"
		: pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * One nav row. Active state is the contract's (§8.1): tinted surface +
 * `text-kumo-strong` + the **fill** icon weight; everything else stays
 * regular-weight and subtle. `aria-current` carries the same information for
 * assistive tech, so colour is never the only signal.
 *
 * The row is a kumo `Sidebar.MenuButton` with `href`, which renders through the
 * app's `LinkProvider` — client-side routing, no document reload.
 */
export function NavRow({
	item,
	active,
}: {
	item: NavItem;
	active: boolean;
}): React.JSX.Element {
	const IconComponent = item.icon;

	return (
		<Sidebar.MenuButton
			href={item.url}
			active={active}
			aria-current={active ? "page" : undefined}
			tooltip={item.title}
			className={cn("min-h-9", active && "text-kumo-strong")}
			icon={
				<IconComponent
					size={20}
					weight={active ? "fill" : "regular"}
					aria-hidden="true"
					className="shrink-0"
				/>
			}
		>
			{item.title}
		</Sidebar.MenuButton>
	);
}

export function NavMain({ items }: { items: NavItem[] }): React.JSX.Element {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<Sidebar.Group>
			<Sidebar.Menu>
				{items.map((item) => (
					<NavRow
						key={item.title}
						item={item}
						active={isNavItemActive(pathname, item.url)}
					/>
				))}
			</Sidebar.Menu>
		</Sidebar.Group>
	);
}
