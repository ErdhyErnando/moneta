import { Badge } from "@cloudflare/kumo/components/badge";
import { Banner } from "@cloudflare/kumo/components/banner";
import { Button } from "@cloudflare/kumo/components/button";
import { Checkbox } from "@cloudflare/kumo/components/checkbox";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { Input } from "@cloudflare/kumo/components/input";
import { LayerCard } from "@cloudflare/kumo/components/layer-card";
import { Select } from "@cloudflare/kumo/components/select";
import { Switch } from "@cloudflare/kumo/components/switch";
import { Table } from "@cloudflare/kumo/components/table";
import { Tabs } from "@cloudflare/kumo/components/tabs";
import { Toasty, useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { Tooltip } from "@cloudflare/kumo/components/tooltip";
import {
	CaretDown,
	Copy,
	Gear,
	Info,
	Plus,
	Trash,
	TrendDown,
	TrendUp,
	Warning,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/layout";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Dev-only reference route (#44 Phase 2). Not registered in production builds:
 * `beforeLoad` throws `notFound()` outside `import.meta.env.DEV`, and D12's
 * route code-splitting keeps its chunk out of the initial bundle.
 */
export const Route = createFileRoute("/_authenticated/design")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound();
	},
	component: DesignPage,
});

/* -------------------------------------------------------------------------- */
/* measurement helpers — the page verifies its own contrast                    */
/* -------------------------------------------------------------------------- */

type Rgba = { r: number; g: number; b: number; a: number };

const canvas = (() => {
	if (typeof document === "undefined") return null;
	const el = document.createElement("canvas");
	el.width = 1;
	el.height = 1;
	return el.getContext("2d", { willReadFrequently: true });
})();

function parseColor(value: string): Rgba | null {
	if (!canvas) return null;
	canvas.clearRect(0, 0, 1, 1);
	canvas.fillStyle = "#000000";
	canvas.fillStyle = value;
	canvas.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
	return { r, g, b, a: (a ?? 255) / 255 };
}

function relativeLuminance({ r, g, b }: Rgba): number {
	const lin = [r, g, b].map((v) => {
		const s = v / 255;
		return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrast(a: Rgba, b: Rgba): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const hi = Math.max(la, lb);
	const lo = Math.min(la, lb);
	return (hi + 0.05) / (lo + 0.05);
}

const hex = ({ r, g, b }: Rgba): string =>
	`#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

/**
 * Reads the *resolved* value of a token. `getPropertyValue("--card")` returns the
 * literal `var(--color-kumo-base)`, so we paint an offscreen element instead and
 * take its computed colour.
 */
function useTokenValue(token: string): string {
	const [value, setValue] = useState("");
	useEffect(() => {
		const read = () => {
			const probe = document.createElement("span");
			probe.style.backgroundColor = `var(${token})`;
			probe.style.display = "none";
			document.body.appendChild(probe);
			const resolved = getComputedStyle(probe).backgroundColor;
			probe.remove();
			setValue(resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : "");
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-mode"],
		});
		return () => observer.disconnect();
	}, [token]);
	return value;
}

function Swatch({
	token,
	label,
	against,
	showRatio = true,
}: {
	token: string;
	label: string;
	against?: string;
	showRatio?: boolean;
}): React.JSX.Element {
	const value = useTokenValue(token);
	const background = useTokenValue(against ?? "--card");
	const color = value ? parseColor(value) : null;
	const bg = background ? parseColor(background) : null;
	const ratio = showRatio && color && bg ? contrast(color, bg) : null;

	return (
		<div className="flex items-center gap-3 rounded-lg border border-kumo-hairline bg-kumo-base p-2">
			<span
				aria-hidden="true"
				className="size-9 shrink-0 rounded-md ring-1 ring-kumo-line"
				style={{ backgroundColor: `var(${token})` }}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-kumo-default text-sm">
					{label}
				</p>
				<p className="truncate font-mono text-kumo-subtle text-xs">
					{token} · {color ? hex(color) : "—"}
				</p>
			</div>
			<span
				className={cn(
					"rounded-full px-2 py-0.5 font-mono text-xs",
					!showRatio
						? "bg-kumo-tint text-kumo-subtle"
						: ratio === null
							? "bg-kumo-tint text-kumo-subtle"
							: ratio >= 4.5
								? "bg-kumo-success-tint text-kumo-success"
								: ratio >= 3
									? "bg-kumo-warning-tint text-kumo-warning"
									: "bg-kumo-danger-tint text-kumo-danger",
				)}
			>
				{!showRatio
					? "surface"
					: ratio === null
						? "—"
						: `${ratio.toFixed(2)}:1`}
			</span>
		</div>
	);
}

function Group({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<LayerCard className="p-4 sm:p-6">
			<h2 className="font-semibold text-kumo-strong text-lg">{title}</h2>
			{description ? (
				<p className="mt-1 text-kumo-subtle text-sm">{description}</p>
			) : null}
			<div className="mt-4">{children}</div>
		</LayerCard>
	);
}

/* -------------------------------------------------------------------------- */
/* the page                                                                    */
/* -------------------------------------------------------------------------- */

const VARIANTS = [
	"primary",
	"secondary",
	"ghost",
	"destructive",
	"outline",
	"secondary-destructive",
] as const;
const SIZES = ["xs", "sm", "base", "lg"] as const;

const COLORS = [
	["--brand", "brand (fill)"],
	["--brand-hover", "brand hover"],
	["--brand-foreground", "brand foreground"],
	["--brand-strong", "brand strong (text)"],
	["--positive", "positive"],
	["--negative", "negative"],
	["--destructive", "destructive"],
	["--chart-1", "chart 1"],
	["--chart-2", "chart 2"],
	["--chart-3", "chart 3"],
	["--chart-4", "chart 4"],
	["--chart-5", "chart 5"],
] as const;

const SURFACES = [
	["--background", "canvas"],
	["--card", "base / card"],
	["--muted", "tint"],
	["--secondary", "recessed"],
	["--border", "hairline"],
] as const;

const CATEGORY_PALETTE = [
	["Healthcare", "#f1779f"],
	["Rent", "#c54c53"],
	["Transportation", "#f47e57"],
	["Gift", "#b1641a"],
	["Other Expense", "#867f79"],
	["Other Income", "#9e9791"],
	["Dining Out", "#d59728"],
	["Education", "#8e791b"],
	["Groceries", "#a2af28"],
	["Cash on Hand", "#208c85"],
	["Salary", "#2eb9c6"],
	["Savings", "#1e83b8"],
	["Freelance", "#50abf8"],
	["Utilities", "#4f74d5"],
	["Investments", "#9c97f8"],
	["Shopping", "#8f5fc4"],
	["Travel", "#d281dc"],
	["Entertainment", "#b54f94"],
] as const;

const SPACING = [
	["space-1", "4px", "w-1"],
	["space-1.5", "6px", "w-1.5"],
	["space-2", "8px", "w-2"],
	["space-3", "12px", "w-3"],
	["space-4", "16px", "w-4"],
	["space-6", "24px", "w-6"],
	["space-8", "32px", "w-8"],
	["space-12", "48px", "w-12"],
] as const;

function ToastTrigger(): React.JSX.Element {
	const toasts = useKumoToastManager();
	return (
		<Button
			variant="secondary"
			onClick={() =>
				toasts.add({
					title: "Expense saved",
					description: "Green brand, kumo toast.",
				})
			}
		>
			Show toast
		</Button>
	);
}

function DesignPage(): React.JSX.Element {
	const { theme, setTheme } = useTheme();
	const [dialogSize, setDialogSize] = useState<"sm" | "base" | "lg" | null>(
		null,
	);
	const [fruit, setFruit] = useState<string | null>("apple");
	const [checked, setChecked] = useState(true);

	return (
		<Toasty>
			<div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
				<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-semibold text-kumo-strong text-xl tracking-tight sm:text-2xl">
							Design reference
						</h1>
						<p className="text-kumo-subtle text-sm">
							Dev-only (#44 Phase 2). Tokens, contrast and components in the
							current theme.
						</p>
					</div>
					<Button
						variant="secondary"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						theme: {theme ?? "system"}
					</Button>
				</header>

				<Group
					title="Color"
					description="Measured live against --card. ≥4.5:1 text, ≥3:1 UI."
				>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{COLORS.map(([token, label]) => (
							<Swatch
								key={token}
								token={token}
								label={label}
								against={token === "--brand-foreground" ? "--brand" : "--card"}
							/>
						))}
					</div>
					<h3 className="mt-6 mb-2 font-medium text-kumo-default text-sm">
						Surfaces
					</h3>
					<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{SURFACES.map(([token, label]) => (
							<Swatch
								key={token}
								token={token}
								label={label}
								showRatio={false}
							/>
						))}
					</div>
					<h3 className="mt-6 mb-2 font-medium text-kumo-default text-sm">
						Category palette (stored anchors)
					</h3>
					<div className="flex flex-wrap gap-2">
						{CATEGORY_PALETTE.map(([name, color]) => (
							<span
								key={name}
								className="inline-flex items-center gap-2 rounded-full border border-kumo-hairline py-1 pr-3 pl-1"
							>
								<span
									aria-hidden="true"
									className="size-5 rounded-full"
									style={{ backgroundColor: color }}
								/>
								<span className="text-xs">{name}</span>
							</span>
						))}
					</div>
				</Group>

				<Group title="Typography" description="kumo scale (D9).">
					<div className="space-y-3">
						<p className="text-kumo-subtle text-xs">
							12px · xs · caption, axis, micro label
						</p>
						<p className="text-kumo-subtle text-sm">
							13px · sm · body secondary
						</p>
						<p className="text-base text-kumo-default">
							14px · base · body, table cells, inputs
						</p>
						<p className="font-semibold text-kumo-strong text-lg">
							16px · lg · section title
						</p>
						<p className="font-semibold text-kumo-strong text-xl tracking-tight">
							20px · xl · page title (mobile)
						</p>
						<p className="font-semibold text-2xl text-kumo-strong tabular-nums tracking-tight">
							$12,480.55 · metric, tabular-nums
						</p>
					</div>
				</Group>

				<Group title="Spacing" description="The closed 8-step scale (§3).">
					<div className="space-y-2">
						{SPACING.map(([name, px, widthClass]) => (
							<div key={name} className="flex items-center gap-3">
								<span className="w-20 font-mono text-kumo-subtle text-xs">
									{name}
								</span>
								<span className="w-10 text-kumo-subtle text-xs">{px}</span>
								<span
									aria-hidden="true"
									className={cn("h-2 rounded-sm bg-kumo-brand", widthClass)}
								/>
							</div>
						))}
					</div>
				</Group>

				<Group
					title="Buttons"
					description="One primary per view. base = 36px, lg only on auth."
				>
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-2">
							{VARIANTS.map((variant) => (
								<Button key={variant} variant={variant}>
									{variant}
								</Button>
							))}
						</div>
						<div className="flex flex-wrap items-end gap-2">
							{SIZES.map((size) => (
								<Button key={size} variant="primary" size={size}>
									primary {size}
								</Button>
							))}
							<Button variant="primary" icon={Plus}>
								with icon
							</Button>
							<Button
								variant="primary"
								shape="square"
								icon={Plus}
								aria-label="Add"
							/>
							<Button variant="secondary" loading>
								loading
							</Button>
							<Button variant="secondary" disabled>
								disabled
							</Button>
						</div>
					</div>
				</Group>

				<Group title="Forms" description="Label above, helper/error below.">
					<div className="grid max-w-2xl gap-4 sm:grid-cols-2">
						<Input label="Description" placeholder="Note" />
						<Input label="Amount" defaultValue="12.50" inputMode="decimal" />
						<Select
							label="Category"
							value={fruit}
							onValueChange={(v) => setFruit(v as string | null)}
							items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
						/>
						<Select
							label="Invalid (error)"
							items={{ a: "A" }}
							description="Helper text is replaced by the error."
						/>
						<div className="flex items-center gap-3">
							<Checkbox checked={checked} onCheckedChange={setChecked} />
							<span className="text-sm">Checkbox</span>
						</div>
						<div className="flex items-center gap-3">
							<Switch defaultChecked />
							<span className="text-sm">Switch</span>
						</div>
					</div>
				</Group>

				<Group title="Tabs, badges, banner">
					<div className="space-y-4">
						<Tabs
							tabs={[
								{ value: "one", label: "Overview" },
								{ value: "two", label: "Breakdown" },
							]}
						/>
						<Tabs
							variant="underline"
							tabs={[
								{ value: "a", label: "Segmented off" },
								{ value: "b", label: "Underline" },
							]}
						/>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="neutral">neutral</Badge>
							<Badge variant="green">green</Badge>
							<Badge variant="red">red</Badge>
							<Badge variant="orange">orange</Badge>
							<Badge variant="blue">blue</Badge>
						</div>
						<Banner
							icon={<Info size={16} />}
							title="Info banner"
							description="One sentence of context."
						/>
						<Banner
							variant="error"
							icon={<Warning size={16} />}
							title="Could not load expenses"
							description="Retry from here."
						/>
					</div>
				</Group>

				<Group
					title="Table"
					description="Zebra rows, numeric right, tabular-nums."
				>
					<Table>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date</Table.Head>
								<Table.Head>Category</Table.Head>
								<Table.Head className="text-right">Amount</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{[
								["Oct 1, 2026", "Dining Out", "-$37.50"],
								["Oct 2, 2026", "Groceries", "-$74.50"],
								["Oct 3, 2026", "Salary", "+$900.00"],
							].map(([date, category, amount]) => (
								<Table.Row key={date}>
									<Table.Cell>{date}</Table.Cell>
									<Table.Cell>{category}</Table.Cell>
									<Table.Cell className="text-right tabular-nums">
										{amount}
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</Group>

				<Group
					title="Overlays"
					description="Dialog/sheet, dropdown, tooltip, toast."
				>
					<div className="flex flex-wrap items-center gap-2">
						{(["sm", "base", "lg"] as const).map((size) => (
							<Button
								key={size}
								variant="secondary"
								onClick={() => setDialogSize(size)}
							>
								dialog {size}
							</Button>
						))}
						<DropdownMenu>
							<DropdownMenu.Trigger
								render={(props) => (
									<Button variant="secondary" icon={CaretDown} {...props}>
										Actions
									</Button>
								)}
							/>
							<DropdownMenu.Content>
								<DropdownMenu.Item icon={Copy}>Duplicate</DropdownMenu.Item>
								<DropdownMenu.Item icon={Gear}>Settings</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item variant="danger" icon={Trash}>
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu>
						<Tooltip
							content="kumo tooltip"
							render={<Button variant="secondary">Hover me</Button>}
						/>
						<ToastTrigger />
					</div>
					<p className="mt-3 text-kumo-subtle text-xs">
						Below md every dialog is a swipeable bottom sheet (kumo
						LayerDialog).
					</p>
				</Group>

				<Group title="Empty state" description="Used by every data region.">
					<EmptyState
						size="sm"
						icon={<TrendDown size={20} />}
						title="No expenses yet"
						description="Add your first expense to see it here."
						action={
							<Button variant="primary" icon={Plus} size="sm">
								Add expense
							</Button>
						}
					/>
					<div className="mt-4">
						<EmptyState
							size="sm"
							icon={<TrendUp size={20} />}
							title="No income in this range"
						/>
					</div>
				</Group>
			</div>

			<ResponsiveDialog
				open={dialogSize !== null}
				onOpenChange={(open) => setDialogSize(open ? dialogSize : null)}
				title={`Dialog ${dialogSize ?? ""}`}
				description="Secondary left, primary right; a bottom sheet below md."
				size={dialogSize ?? "base"}
				action={{
					label: "Save",
					onClick: () => setDialogSize(null),
				}}
			>
				<p className="text-sm">
					Dialog body. Resize the window below 768px to see the sheet.
				</p>
			</ResponsiveDialog>
		</Toasty>
	);
}
