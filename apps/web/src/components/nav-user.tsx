import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	BellIcon,
	CreditCardIcon,
	DotsThreeVerticalIcon,
	SignOutIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import type * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/primitives";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}): React.JSX.Element {
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenu.Trigger>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="size-8">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="bg-kumo-tint font-medium text-kumo-strong">
									M
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-kumo-subtle text-xs">
									{user.email}
								</span>
							</div>
							<DotsThreeVerticalIcon className="ml-auto" size={16} />
						</SidebarMenuButton>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						className="min-w-56"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="size-8">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="bg-kumo-tint font-medium text-kumo-strong">
										M
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-kumo-subtle text-xs">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item icon={<UserCircleIcon size={16} />}>
							Account
						</DropdownMenu.Item>
						<DropdownMenu.Item icon={<CreditCardIcon size={16} />}>
							Billing
						</DropdownMenu.Item>
						<DropdownMenu.Item icon={<BellIcon size={16} />}>
							Notifications
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item icon={<SignOutIcon size={16} />}>
							Log out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
