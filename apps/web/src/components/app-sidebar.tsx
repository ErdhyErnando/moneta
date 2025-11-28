import {
	IconDashboard,
	IconHelp,
	IconLogout,
	IconMoon,
	IconSettings,
	IconSun,
	IconTrendingDown,
	IconTrendingUp,
	IconWallet,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { Currency } from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const navMainItems = [
	{
		title: "Dashboard",
		url: "/",
		icon: IconDashboard,
	},
	{
		title: "Income",
		url: "/income",
		icon: IconTrendingUp,
	},
	{
		title: "Expense",
		url: "/expense",
		icon: IconTrendingDown,
	},
	{
		title: "Starting Balance",
		url: "/starting-balance",
		icon: IconWallet,
	},
];

const navSecondaryItems = [
	{
		title: "Settings",
		url: "#",
		icon: IconSettings,
	},
	{
		title: "Help",
		url: "#",
		icon: IconHelp,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();
	const { setTheme } = useTheme();
	const { data: session } = authClient.useSession();

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
				avatar: "/avatars/shadcn.jpg",
			}
		: {
				name: "Guest",
				email: "guest@example.com",
				avatar: "/avatars/shadcn.jpg",
			};

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="/">
								<Currency className="size-5!" />
								<h3 className="font-bold text-base">Moneta</h3>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navMainItems} />
				<NavSecondary items={navSecondaryItems} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator />
				<div className="flex items-center justify-between gap-2 px-2 py-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon" className="size-9">
								<IconSun className="dark:-rotate-90 size-4 rotate-0 scale-100 transition-all dark:scale-0" />
								<IconMoon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTheme("light")}>
								Light
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("dark")}>
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("system")}>
								System
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="outline"
						size="icon"
						className="size-9"
						onClick={handleSignOut}
					>
						<IconLogout className="size-4" />
						<span className="sr-only">Sign out</span>
					</Button>
				</div>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
