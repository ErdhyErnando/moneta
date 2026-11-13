import {
	ArrowsLeftRight,
	Gear,
	Question,
	Stack,
	Wallet,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
	AddTransactionForm,
	type AddTransactionType,
} from "@/components/add-transaction-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

/**
 * The two mobile sheets, kept in one lazily-loaded module so kumo's dialog
 * primitive (LayerDialog + Base UI Drawer, ~290 kB) stays out of the first
 * authenticated paint and loads on first open.
 */

type MoreItem = {
	label: string;
	icon: ReactNode;
	/** Absent while Help has no destination — rendered as a disabled row. */
	to?: "/mutations" | "/assets" | "/starting-balance" | "/settings";
};

const MORE_ITEMS: MoreItem[] = [
	{ label: "Mutations", to: "/mutations", icon: <ArrowsLeftRight size={20} /> },
	{ label: "Assets", to: "/assets", icon: <Stack size={20} /> },
	{
		label: "Starting Balance",
		to: "/starting-balance",
		icon: <Wallet size={20} />,
	},
	{ label: "Settings", to: "/settings", icon: <Gear size={20} /> },
	{ label: "Help", icon: <Question size={20} /> },
];

type AddTransactionSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultType?: AddTransactionType;
};

export function AddTransactionSheet({
	open,
	onOpenChange,
	defaultType = "expense",
}: AddTransactionSheetProps): React.JSX.Element {
	const [type, setType] = useState<AddTransactionType>(defaultType);

	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			size="base"
			title={`Add ${type === "expense" ? "expense" : "income"}`}
			description="Log a new transaction without leaving the page."
		>
			<AddTransactionForm
				type={type}
				onTypeChange={setType}
				onSuccess={() => onOpenChange(false)}
			/>
		</ResponsiveDialog>
	);
}

export function MoreSheet({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): React.JSX.Element {
	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			size="sm"
			title="More"
			description="Everything else in Moneta."
		>
			<ul className="divide-y divide-kumo-hairline">
				{MORE_ITEMS.map((item) => (
					<li key={item.label}>
						{item.to ? (
							<Link
								to={item.to}
								onClick={() => onOpenChange(false)}
								className="flex min-h-11 items-center gap-3 py-3 text-kumo-default"
							>
								<span className="text-kumo-subtle">{item.icon}</span>
								{item.label}
							</Link>
						) : (
							<span
								aria-disabled="true"
								className="flex min-h-11 items-center gap-3 py-3 text-kumo-inactive"
							>
								<span className="text-kumo-subtle">{item.icon}</span>
								{item.label}
							</span>
						)}
					</li>
				))}
			</ul>
		</ResponsiveDialog>
	);
}
