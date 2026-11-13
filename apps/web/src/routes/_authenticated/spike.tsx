import { Button as KumoButton } from "@cloudflare/kumo/components/button";
import { Dialog as KumoDialog } from "@cloudflare/kumo/components/dialog";
import { DropdownMenu as KumoDropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { LayerDialog as KumoLayerDialog } from "@cloudflare/kumo/components/layer-dialog";
import { Select as KumoSelect } from "@cloudflare/kumo/components/select";
import { Table as KumoTable } from "@cloudflare/kumo/components/table";
import { Toasty, useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { Tooltip as KumoTooltip } from "@cloudflare/kumo/components/tooltip";
import {
	ArrowLeft,
	CaretDown,
	Copy,
	Gear,
	Plus,
	Trash,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/spike")({
	component: SpikePage,
});

// ECharts must land only in a lazy chunk (experiment 5).
const LazyKumoChart = lazy(() => import("./-spike-chart"));

const VARIANTS = [
	"primary",
	"secondary",
	"ghost",
	"destructive",
	"outline",
	"secondary-destructive",
] as const;
const SIZES = ["xs", "sm", "base", "lg"] as const;

function Probe() {
	const [dump, setDump] = useState("");

	const read2 = () => {
		if (typeof window === "undefined") return;
		const root = getComputedStyle(document.documentElement);
		const primary = document.querySelector<HTMLElement>(
			'[data-kumo-component="Button"][style*="--color-kumo-brand"]',
		);
		const destructive = document.querySelector<HTMLElement>(
			'[data-kumo-component="Button"][style*="--color-kumo-danger"]',
		);
		const secondary = document.querySelector<HTMLElement>(
			'[data-kumo-component="Button"][class*="bg-kumo-base"]',
		);
		const pick = (el: HTMLElement | null) =>
			el
				? {
						color: getComputedStyle(el).color,
						bg: getComputedStyle(el).backgroundColor,
						height: getComputedStyle(el).height,
						radius: getComputedStyle(el).borderRadius,
						shadow: getComputedStyle(el).boxShadow.slice(0, 120),
					}
				: null;
		(window as unknown as Record<string, unknown>).__spikeRead = () => ({
			attr: {
				class: document.documentElement.className,
				dataMode: document.documentElement.getAttribute("data-mode"),
				colorScheme: getComputedStyle(document.documentElement).colorScheme,
			},
			tokens: {
				brand: root.getPropertyValue("--color-kumo-brand").trim(),
				brandHover: root.getPropertyValue("--color-kumo-brand-hover").trim(),
				textBrand: root.getPropertyValue("--text-color-kumo-brand").trim(),
				focus: root.getPropertyValue("--color-kumo-focus").trim(),
				canvas: root.getPropertyValue("--color-kumo-canvas").trim(),
				base: root.getPropertyValue("--color-kumo-base").trim(),
			},
			primary: pick(primary),
			destructive: pick(destructive),
			secondary: pick(secondary),
		});
	};

	useEffect(() => {
		read2();
		const read = (el: Element | null, props: string[]) => {
			if (!el) return {};
			const cs = getComputedStyle(el);
			return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
		};
		const root = getComputedStyle(document.documentElement);
		const primary = document.querySelector<HTMLElement>(
			'[data-kumo-component="Button"][style*="--color-kumo-brand"]',
		);
		const secondary = document.querySelector<HTMLElement>(
			'[data-kumo-component="Button"][class*="bg-kumo-base"]',
		);
		const data = {
			htmlClass: document.documentElement.className,
			dataMode: document.documentElement.getAttribute("data-mode"),
			colorScheme: getComputedStyle(document.documentElement).colorScheme,
			tokens: {
				"--color-kumo-brand": root
					.getPropertyValue("--color-kumo-brand")
					.trim(),
				"--color-kumo-brand-hover": root
					.getPropertyValue("--color-kumo-brand-hover")
					.trim(),
				"--text-color-kumo-brand": root
					.getPropertyValue("--text-color-kumo-brand")
					.trim(),
				"--color-kumo-focus": root
					.getPropertyValue("--color-kumo-focus")
					.trim(),
				"--color-kumo-canvas": root
					.getPropertyValue("--color-kumo-canvas")
					.trim(),
			},
			primaryButton: {
				styleAttr: primary?.getAttribute("style") ?? null,
				computed: read(primary, [
					"color",
					"background-color",
					"--kumo-button-emphasis-bg",
					"--kumo-button-emphasis-ring",
					"--kumo-button-emphasis-gradient-start",
					"--kumo-button-emphasis-gradient-end",
					"height",
					"box-shadow",
				]),
			},
			secondaryButton: {
				computed: read(secondary, ["color", "background-color", "height"]),
			},
			// sanity: does anything of ours still look right (shadcn button)?
			shadcnCard: read(document.querySelector("[data-shadcn-card]"), [
				"background-color",
				"border-color",
				"border-radius",
			]),
			shadcnButton: read(document.querySelector("[data-slot=button]"), [
				"background-color",
				"border-radius",
				"height",
			]),
			stickyHeaderZ: read(document.querySelector("[data-spike-header]"), [
				"z-index",
				"isolation",
				"position",
			]),
		};
		setDump(JSON.stringify(data, null, 2));
	}, []);

	return (
		<pre
			id="spike-probe"
			data-spike-probe
			className="max-h-96 overflow-auto rounded-lg bg-kumo-tint p-3 font-mono text-xs"
		>
			{dump}
		</pre>
	);
}

function Toaster() {
	const toasts = useKumoToastManager();
	return (
		<KumoButton
			variant="secondary"
			onClick={() =>
				toasts.add({
					title: "Kumo toast",
					description: "Green brand + toast stack.",
				})
			}
		>
			Fire toast
		</KumoButton>
	);
}

function SpikePage() {
	const { theme, setTheme } = useTheme();
	const [size, setSize] = useState<"sm" | "base" | "lg">("base");
	const [fruit, setFruit] = useState<string | null>("apple");

	return (
		<Toasty>
			<div className="container mx-auto max-w-6xl space-y-10 px-4 py-8">
				<header
					data-spike-header
					className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b bg-background/95 py-3 backdrop-blur"
				>
					<div>
						<h1 className="font-bold text-2xl">kumo spike (#44)</h1>
						<p className="text-muted-foreground text-sm">
							theme = {theme} · data-mode ={" "}
							{typeof document === "undefined"
								? "-"
								: (document.documentElement.getAttribute("data-mode") ?? "∅")}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							data-spike-toggle
							variant="outline"
							size="sm"
							onClick={() =>
								setTheme(
									document.documentElement.getAttribute("data-mode") === "dark"
										? "light"
										: "dark",
								)
							}
						>
							toggle theme
						</Button>
					</div>
				</header>

				{/* 1. Button: variants + sizes */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">1. Button — all variants</h2>
					<div className="flex flex-wrap items-center gap-2">
						{VARIANTS.map((v) => (
							<KumoButton key={v} variant={v}>
								{v}
							</KumoButton>
						))}
					</div>
					<div className="flex flex-wrap items-end gap-2">
						{SIZES.map((s) => (
							<KumoButton key={s} variant="primary" size={s}>
								primary {s}
							</KumoButton>
						))}
						{KumoButton && (
							<KumoButton variant="primary" icon={Plus} loading>
								loading
							</KumoButton>
						)}
						<KumoButton
							variant="primary"
							shape="square"
							icon={Plus}
							aria-label="Add"
						/>
						<KumoButton variant="secondary" icon={ArrowLeft}>
							with icon
						</KumoButton>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-xs">shadcn:</span>
						<Button>default</Button>
						<Button variant="secondary">secondary</Button>
						<Button variant="outline">outline</Button>
						<Button variant="ghost">ghost</Button>
						<Button variant="destructive">destructive</Button>
					</div>
				</section>

				{/* 2. Dialog */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">2. Dialog — sm/base/lg</h2>
					<div className="flex flex-wrap gap-2">
						{(["sm", "base", "lg"] as const).map((s) => (
							<KumoDialog.Root key={s}>
								<KumoDialog.Trigger
									render={(p) => (
										<KumoButton variant="secondary" {...p}>
											kumo dialog {s}
										</KumoButton>
									)}
								/>
								<KumoDialog size={s}>
									<KumoDialog.Title>Kumo {s} dialog</KumoDialog.Title>
									<KumoDialog.Description>
										Green primary action below. Size = {s}.
									</KumoDialog.Description>
									<div className="mt-4 flex justify-end gap-2">
										<KumoDialog.Close
											render={(p) => (
												<KumoButton variant="secondary" {...p}>
													Cancel
												</KumoButton>
											)}
										/>
										<KumoButton variant="primary">Confirm</KumoButton>
									</div>
								</KumoDialog>
							</KumoDialog.Root>
						))}
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">shadcn dialog</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>shadcn dialog</DialogTitle>
									<DialogDescription>
										For comparison with kumo&apos;s dialog.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<Button variant="outline">Cancel</Button>
									<Button>Confirm</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
					<div className="flex gap-2">
						<Select
							value={size}
							onValueChange={(v) => setSize(v as typeof size)}
						>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="shadcn size" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="sm">sm</SelectItem>
								<SelectItem value="base">base</SelectItem>
								<SelectItem value="lg">lg</SelectItem>
							</SelectContent>
						</Select>
						<span className="self-center text-muted-foreground text-xs">
							shadcn select · {size}
						</span>
						<KumoDialog.Root>
							<KumoDialog.Trigger
								render={(p) => (
									<KumoButton size="sm" variant="outline" {...p}>
										dialog containing select
									</KumoButton>
								)}
							/>
							<KumoDialog size="base">
								<KumoDialog.Title>Select inside dialog</KumoDialog.Title>
								<KumoSelect
									label="Fruit"
									value={fruit}
									onValueChange={(v) => setFruit(v as string | null)}
									items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
								/>
							</KumoDialog>
						</KumoDialog.Root>
					</div>
				</section>

				{/* 3. Select / Tooltip / Dropdown */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">
						3. Select · Tooltip · Dropdown
					</h2>
					<div className="flex flex-wrap items-center gap-3">
						<KumoSelect
							label="Fruit"
							size="base"
							value={fruit}
							onValueChange={(v) => setFruit(v as string | null)}
							items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
							className="w-48"
						/>
						<KumoSelect
							label="Size"
							size="sm"
							items={{ xs: "xs", sm: "sm", base: "base", lg: "lg" }}
							className="w-36"
						/>
						<KumoTooltip
							content="kumo tooltip"
							render={<KumoButton variant="outline">hover me</KumoButton>}
						/>
						<KumoDropdownMenu>
							<KumoDropdownMenu.Trigger
								render={(p) => (
									<KumoButton variant="secondary" icon={CaretDown} {...p}>
										Actions
									</KumoButton>
								)}
							/>
							<KumoDropdownMenu.Content>
								<KumoDropdownMenu.Item icon={Copy}>
									Duplicate
								</KumoDropdownMenu.Item>
								<KumoDropdownMenu.Item icon={Gear}>
									Settings
								</KumoDropdownMenu.Item>
								<KumoDropdownMenu.Separator />
								<KumoDropdownMenu.Item variant="danger" icon={Trash}>
									Delete
								</KumoDropdownMenu.Item>
							</KumoDropdownMenu.Content>
						</KumoDropdownMenu>
						<Toaster />
					</div>
				</section>

				{/* 4. Table */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">4. Table (kumo vs shadcn)</h2>
					<div className="rounded-lg border">
						<KumoTable>
							<KumoTable.Header>
								<KumoTable.Row>
									<KumoTable.Head>Date</KumoTable.Head>
									<KumoTable.Head>Category</KumoTable.Head>
									<KumoTable.Head>Description</KumoTable.Head>
									<KumoTable.Head>Amount</KumoTable.Head>
								</KumoTable.Row>
							</KumoTable.Header>
							<KumoTable.Body>
								{["Oct 1", "Oct 2", "Oct 3"].map((d, i) => (
									<KumoTable.Row key={d}>
										<KumoTable.Cell>{d}</KumoTable.Cell>
										<KumoTable.Cell>Dining Out</KumoTable.Cell>
										<KumoTable.Cell>kumo row {i + 1}</KumoTable.Cell>
										<KumoTable.Cell>
											-${(37.5 * (i + 1)).toFixed(2)}
										</KumoTable.Cell>
									</KumoTable.Row>
								))}
							</KumoTable.Body>
						</KumoTable>
					</div>
					<div className="rounded-lg border" data-shadcn-card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{["Oct 1", "Oct 2", "Oct 3"].map((d, i) => (
									<TableRow key={d}>
										<TableCell>{d}</TableCell>
										<TableCell>Dining Out</TableCell>
										<TableCell>shadcn row {i + 1}</TableCell>
										<TableCell>-${(37.5 * (i + 1)).toFixed(2)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</section>

				{/* 4b. LayerDialog: dialog >=sm, bottom sheet <sm */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">
						4b. LayerDialog (responsive: dialog ≥sm / sheet &lt;sm)
					</h2>
					<div className="flex flex-wrap items-center gap-2">
						<KumoLayerDialog>
							<KumoLayerDialog.Trigger
								render={(p) => (
									<KumoButton
										variant="primary"
										data-layer-dialog-trigger
										{...p}
									>
										open LayerDialog
									</KumoButton>
								)}
							/>
							<KumoLayerDialog.Content size="base" verticalAlign="center">
								<KumoLayerDialog.Title>Add transaction</KumoLayerDialog.Title>
								<KumoLayerDialog.Description>
									Desktop → centered dialog. Mobile → bottom sheet.
								</KumoLayerDialog.Description>
								<KumoLayerDialog.Body>
									<p className="text-kumo-subtle text-sm">
										Body content. Swipe down on mobile to dismiss.
									</p>
								</KumoLayerDialog.Body>
								<KumoLayerDialog.Actions>
									<KumoLayerDialog.Action variant="primary">
										Save
									</KumoLayerDialog.Action>
								</KumoLayerDialog.Actions>
							</KumoLayerDialog.Content>
						</KumoLayerDialog>
					</div>
				</section>

				{/* 5. Chart (lazy, ECharts) */}
				<section className="space-y-4">
					<h2 className="font-semibold text-lg">
						5. kumo Chart (ECharts, green)
					</h2>
					<Suspense
						fallback={
							<div className="h-80 animate-pulse rounded-lg bg-kumo-tint" />
						}
					>
						<LazyKumoChart />
					</Suspense>
				</section>

				{/* probe */}
				<section className="space-y-2">
					<h2 className="font-semibold text-lg">Probe (computed styles)</h2>
					<Probe />
				</section>
			</div>
		</Toasty>
	);
}
