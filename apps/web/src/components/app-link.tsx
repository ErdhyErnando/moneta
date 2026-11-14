import type { LinkComponentProps } from "@cloudflare/kumo";
import { Link } from "@tanstack/react-router";
import * as React from "react";

type AnchorProps = LinkComponentProps;

const isExternal = (href: string): boolean =>
	href.startsWith("http://") ||
	href.startsWith("https://") ||
	href.startsWith("mailto:");

/**
 * Bridges kumo's `LinkProvider` to TanStack Router, so every kumo component
 * that renders a link (`Sidebar.MenuButton`, `LinkButton`, …) navigates
 * client-side instead of reloading the document.
 *
 * Only in-app paths go through the router: external URLs and placeholder
 * anchors (`#`) stay plain `<a>` tags, because TanStack would reject them as
 * unknown routes.
 */
export const AppLink = React.forwardRef<HTMLAnchorElement, AnchorProps>(
	({ href, ...rest }, ref) => {
		const to = href ?? "/";
		if (isExternal(to) || to === "#" || to.startsWith("#")) {
			return <a ref={ref} href={to} {...rest} />;
		}

		return (
			<Link
				ref={ref}
				// `to` is typed against the generated route tree; these hrefs come
				// from plain data, so the cast is the boundary, not a shortcut.
				to={to as Parameters<typeof Link>[0]["to"]}
				{...rest}
			/>
		);
	},
);

AppLink.displayName = "AppLink";
