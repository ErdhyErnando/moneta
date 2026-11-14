import { Button } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { useSidebar } from "@cloudflare/kumo/components/sidebar";
import {
	CheckIcon,
	MoonIcon,
	SignOutIcon,
	SunIcon,
} from "@phosphor-icons/react";
import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/primitives";
import { useTheme } from "@/components/theme-provider";

type NavUserProps = {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
	onSignOut: () => void;
};

const THEMES = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
] as const;

/**
 * The account block in the sidebar footer. Collapsed, it is the avatar alone —
 * and because a 57px rail cannot show the dedicated theme/sign-out buttons, it
 * absorbs them as menu items so nothing becomes unreachable (§8.1).
 */
export function NavUser({ user, onSignOut }: NavUserProps): React.JSX.Element {
	// `theme` is the stored choice (light/dark/system); `resolvedTheme` is only
	// ever light/dark, so it can't mark "System" as selected.
	const { theme: currentTheme, setTheme } = useTheme();
	const { state } = useSidebar();
	const collapsed = state !== "expanded";
	const initial = (user.name || user.email).slice(0, 1).toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="ghost"
					className="h-auto w-full min-w-0 justify-start gap-2 px-1 py-1"
					aria-label={`Account menu for ${user.name}`}
					icon={
						<Avatar className="size-8 shrink-0">
							<AvatarImage src={user.avatar} alt="" />
							<AvatarFallback className="bg-kumo-tint font-medium text-kumo-strong">
								{initial}
							</AvatarFallback>
						</Avatar>
					}
				>
					{collapsed ? null : (
						<span className="grid min-w-0 flex-1 text-left leading-tight">
							<span className="truncate font-medium text-sm">{user.name}</span>
							<span className="truncate text-kumo-subtle text-xs">
								{user.email}
							</span>
						</span>
					)}
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" side="right" className="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label className="font-normal">
						<div className="flex flex-col py-1">
							<span className="truncate font-medium text-sm">{user.name}</span>
							<span className="truncate text-kumo-subtle text-xs">
								{user.email}
							</span>
						</div>
					</DropdownMenu.Label>
					<DropdownMenu.Separator />
					{collapsed ? (
						<>
							{THEMES.map((theme) => (
								<DropdownMenu.Item
									key={theme.value}
									onClick={() => setTheme(theme.value)}
									className="justify-between"
								>
									{theme.label}
									{currentTheme === theme.value ? (
										<CheckIcon size={16} className="text-kumo-brand" />
									) : null}
								</DropdownMenu.Item>
							))}
							<DropdownMenu.Separator />
						</>
					) : null}
					<DropdownMenu.Item onClick={onSignOut}>
						<SignOutIcon size={16} />
						Log out
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}

/** Theme menu for the expanded footer (collapsed, the actions live in `NavUser`). */
export function SidebarThemeMenu(): React.JSX.Element {
	const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="ghost"
					size="sm"
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
			<DropdownMenu.Content align="end" side="top">
				<DropdownMenu.Group>
					{THEMES.map((theme) => (
						<DropdownMenu.Item
							key={theme.value}
							onClick={() => setTheme(theme.value)}
							className="justify-between"
						>
							{theme.label}
							{currentTheme === theme.value ? (
								<CheckIcon size={16} className="text-kumo-brand" />
							) : null}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}
