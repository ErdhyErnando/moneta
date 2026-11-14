import { Sidebar } from "@cloudflare/kumo/components/sidebar";
import { useRouterState } from "@tanstack/react-router";
import type * as React from "react";
import { isNavItemActive, type NavItem, NavRow } from "@/components/nav-main";

/**
 * The bottom group of the sidebar (Settings · Help, §8.1). Same rows as the
 * main group; it only differs in position and in having no group label.
 */
export function NavSecondary({
	items,
	className,
}: {
	items: NavItem[];
	className?: string;
}): React.JSX.Element {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<Sidebar.Group className={className}>
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
