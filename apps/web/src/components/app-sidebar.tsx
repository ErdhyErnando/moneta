import { Button } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	ArrowsLeftRightIcon,
	GearSixIcon,
	MoonIcon,
	QuestionIcon,
	SignOutIcon,
	SquaresFourIcon,
	StackIcon,
	SunIcon,
	TrendDownIcon,
	TrendUpIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { useTheme } from "@/components/theme-provider";
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
		icon: SquaresFourIcon,
	},
	{
		title: "Income",
		url: "/income",
		icon: TrendUpIcon,
	},
	{
		title: "Expense",
		url: "/expense",
		icon: TrendDownIcon,
	},
	{
		title: "Mutations",
		url: "/mutations",
		icon: ArrowsLeftRightIcon,
	},
	{
		title: "Assets",
		url: "/assets",
		icon: StackIcon,
	},
	{
		title: "Starting Balance",
		url: "/starting-balance",
		icon: WalletIcon,
	},
];

const navSecondaryItems = [
	{
		title: "Settings",
		url: "/settings",
		icon: GearSixIcon,
	},
	{
		title: "Help",
		url: "#",
		icon: QuestionIcon,
	},
];

export function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>): React.JSX.Element {
	const navigate = useNavigate();
	const { resolvedTheme, setTheme } = useTheme();
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
				avatar: (session.user as { image?: string | null }).image || "",
			}
		: {
				name: "Guest",
				email: "guest@example.com",
				avatar: "",
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
								<img src="/logo.png" alt="Logo" className="size-7 rounded-md" />
								<h3 className="font-semibold text-base">Moneta</h3>
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
						<DropdownMenu.Trigger>
							<Button
								variant="secondary"
								shape="square"
								aria-label="Toggle theme"
								icon={
									resolvedTheme === "dark" ? (
										<MoonIcon size={16} />
									) : (
										<SunIcon size={16} />
									)
								}
							/>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item onClick={() => setTheme("light")}>
								Light
							</DropdownMenu.Item>
							<DropdownMenu.Item onClick={() => setTheme("dark")}>
								Dark
							</DropdownMenu.Item>
							<DropdownMenu.Item onClick={() => setTheme("system")}>
								System
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu>
					<Button
						variant="secondary"
						shape="square"
						aria-label="Sign out"
						onClick={handleSignOut}
						icon={<SignOutIcon size={16} />}
					/>
				</div>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
