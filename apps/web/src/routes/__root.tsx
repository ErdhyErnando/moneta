import { Toasty } from "@cloudflare/kumo/components/toast";
import { LinkProvider } from "@cloudflare/kumo/utils";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppLink } from "@/components/app-link";
import { ThemeProvider } from "@/components/theme-provider";
import "../index.css";

export type RouterAppContext = Record<string, never>;

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Moneta",
			},
			{
				name: "description",
				content:
					"Moneta — personal finance: income, expenses and holdings in one ledger.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute={["class", "data-mode"]}
				defaultTheme="dark"
				disableTransitionOnChange
				enableColorScheme
				storageKey="vite-ui-theme"
				// No `value` map: next-themes applies the theme name as the class, and
				// our theme names are already `light`/`dark` (spike §2). It only ever
				// affected the class attribute, never `data-mode` — D14.
			>
				{/* kumo: isolating the app root keeps portalled popups above our own
				    sticky headers, which use positive z-index. */}
				<Toasty>
					{/* Every kumo link (sidebar items, LinkButton) goes through the router. */}
					<LinkProvider component={AppLink}>
						<div className="isolate h-svh">
							<Outlet />
						</div>
					</LinkProvider>
				</Toasty>
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
