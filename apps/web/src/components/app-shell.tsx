import {
	SidebarProvider,
	useSidebar,
} from "@cloudflare/kumo/components/sidebar";
import { Outlet } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";

// The sheets (and kumo's ~290 kB dialog primitive) load on first open, not on
// the first authenticated paint.
const AddTransactionSheet = lazy(() =>
	import("@/components/mobile-sheets").then((m) => ({
		default: m.AddTransactionSheet,
	})),
);
const MoreSheet = lazy(() =>
	import("@/components/mobile-sheets").then((m) => ({ default: m.MoreSheet })),
);

/* -------------------------------------------------------------------------- */
/* Sidebar state persistence (docs/design.md §8.1)                             */
/*                                                                             */
/* The pre-kumo shell wrote a `sidebar_state` cookie but never read it back, so */
/* collapsing lasted exactly until the next reload. Same cookie, same name and  */
/* lifetime, now read on mount as the sidebar's initial state — a cookie rather */
/* than localStorage so a server render can read it later.                      */
/* -------------------------------------------------------------------------- */

const SIDEBAR_COOKIE = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_SHORTCUT = "b";

function readSidebarCookie(): boolean {
	if (typeof document === "undefined") return true;
	for (const entry of document.cookie.split(";")) {
		const [key, value] = entry.trim().split("=");
		if (key === SIDEBAR_COOKIE) return value !== "false";
	}
	return true;
}

function writeSidebarCookie(open: boolean): void {
	// biome-ignore lint/suspicious/noDocumentCookie: a cookie (not localStorage) is the point — it stays readable server-side, and the Cookie Store API is not available in every browser we target.
	document.cookie = `${SIDEBAR_COOKIE}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

/** ⌘/Ctrl+B toggles the sidebar — the old shell's shortcut, kept (§8.1). */
function useSidebarShortcut(): void {
	const { toggleSidebar } = useSidebar();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() !== SIDEBAR_SHORTCUT) return;
			if (!event.metaKey && !event.ctrlKey) return;
			event.preventDefault();
			toggleSidebar();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [toggleSidebar]);
}

function Shell(): React.JSX.Element {
	const [addOpen, setAddOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);

	useSidebarShortcut();

	return (
		<>
			<AppSidebar />

			{/* No app-level top bar: every page owns its PageHeader (§7.1), and the
			    only thing the old bar held was the collapse toggle, which now lives
			    in the sidebar header.
			    `relative` makes this scroll column the containing block for absolutely
			    positioned descendants (e.g. `sr-only` labels in SignedAmount). Without
			    it they resolve against the shell root, escape the overflow clip and
			    stretch the document — a second scrollbar plus empty space below the
			    page. */}
			<div className="relative flex min-w-0 flex-1 flex-col overflow-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
				<Outlet />
			</div>

			<BottomNav
				onAddTransaction={() => setAddOpen(true)}
				onMore={() => setMoreOpen(true)}
			/>

			<Suspense fallback={null}>
				{addOpen ? (
					<AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />
				) : null}
				{moreOpen ? (
					<MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
				) : null}
			</Suspense>
		</>
	);
}

export function AppShell(): React.JSX.Element {
	const [defaultOpen] = useState(readSidebarCookie);

	return (
		<SidebarProvider
			collapsible="icon"
			// The shell owns the viewport height; only the main column scrolls.
			className="h-full min-h-0"
			defaultOpen={defaultOpen}
			onOpenChange={(open) => writeSidebarCookie(open)}
			// Expanded width follows the contract (256px vs kumo's 260px). The icon
			// rail stays at kumo's 57px: its row padding, icon offset and per-row
			// overflow clip are tuned for that width, and at 48px the 20px icons
			// lose their right edge.
			style={{ "--sidebar-width": "16rem" } as React.CSSProperties}
		>
			<Shell />
		</SidebarProvider>
	);
}
