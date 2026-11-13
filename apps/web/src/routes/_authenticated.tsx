import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

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

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const { data: session } = await authClient.getSession();
		if (!session) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	const [addOpen, setAddOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				{/* Desktop-only chrome: below md the bottom nav is the navigation. */}
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 max-md:hidden">
					<SidebarTrigger className="-ml-1" />
				</header>
				<div className="flex flex-1 flex-col overflow-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
					<Outlet />
				</div>
			</SidebarInset>

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
		</SidebarProvider>
	);
}
