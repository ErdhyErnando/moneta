import { Button } from "@cloudflare/kumo";
import { Sidebar, useSidebar } from "@cloudflare/kumo/components/sidebar";
import {
	ArrowsLeftRightIcon,
	GearSixIcon,
	QuestionIcon,
	SignOutIcon,
	SquaresFourIcon,
	StackIcon,
	TrendDownIcon,
	TrendUpIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import type * as React from "react";
import { type NavItem, NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser, SidebarThemeMenu } from "@/components/nav-user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navMainItems: NavItem[] = [
	{ title: "Dashboard", url: "/", icon: SquaresFourIcon },
	{ title: "Income", url: "/income", icon: TrendUpIcon },
	{ title: "Expense", url: "/expense", icon: TrendDownIcon },
	{ title: "Mutations", url: "/mutations", icon: ArrowsLeftRightIcon },
	{ title: "Assets", url: "/assets", icon: StackIcon },
	{ title: "Starting Balance", url: "/starting-balance", icon: WalletIcon },
];

const navSecondaryItems: NavItem[] = [
	{ title: "Settings", url: "/settings", icon: GearSixIcon },
	{ title: "Help", url: "#", icon: QuestionIcon },
];

export function AppSidebar(): React.JSX.Element {
	const navigate = useNavigate();
	const { state } = useSidebar();
	const { data: session } = authClient.useSession();
	const collapsed = state !== "expanded";

	const handleSignOut = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/login" });
				},
			},
		});
	};

	const user = session
		? {
				name: session.user.name || "User",
				email: session.user.email,
				avatar: (session.user as { image?: string | null }).image || "",
			}
		: { name: "Guest", email: "guest@example.com", avatar: "" };

	return (
		<Sidebar>
			<Sidebar.Header
				className={cn(
					"transition-[padding]",
					collapsed && "justify-center px-0",
				)}
			>
				<Link
					to="/"
					className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg p-1"
					aria-label="Moneta — go to dashboard"
				>
					<img
						src="/logo.png"
						alt=""
						className="size-7 shrink-0 rounded-md"
						width={28}
						height={28}
					/>
					<span className="truncate font-semibold text-base text-kumo-strong">
						Moneta
					</span>
				</Link>
				<Sidebar.Trigger aria-label="Toggle sidebar" />
			</Sidebar.Header>

			<Sidebar.Content>
				<div className="flex flex-col gap-2">
					<NavMain items={navMainItems} />
					<NavSecondary items={navSecondaryItems} />
				</div>
			</Sidebar.Content>

			<Sidebar.Footer className={cn(collapsed && "justify-center px-0")}>
				<div className={collapsed ? "shrink-0" : "min-w-0 flex-1"}>
					<NavUser user={user} onSignOut={handleSignOut} />
				</div>
				{collapsed ? null : (
					<div className="flex shrink-0 items-center gap-1">
						<SidebarThemeMenu />
						<Button
							variant="ghost"
							size="sm"
							shape="square"
							aria-label="Sign out"
							onClick={handleSignOut}
							icon={<SignOutIcon size={16} />}
						/>
					</div>
				)}
			</Sidebar.Footer>
		</Sidebar>
	);
}
