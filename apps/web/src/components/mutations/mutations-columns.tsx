import { Badge, Button } from "@cloudflare/kumo";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretUpDownIcon,
} from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CategoryBadge } from "@/components/category-badge";
import { SignedAmount } from "@/components/money/signed-amount";
import { asUtcDay } from "@/lib/date";
import type { MutationRow } from "@/lib/mutations";

export type MutationSortColumn = "date" | "amount";
export type MutationSortDir = "asc" | "desc";

type Options = {
	formatCurrency: (amount: number) => string;
	sort: MutationSortColumn;
	dir: MutationSortDir;
	onSortChange: (column: MutationSortColumn) => void;
};

/** Column ids the stacked (<md) row reads by name — keep them stable. */
export const MUTATION_COLUMN_ID = {
	date: "date",
	type: "type",
	category: "categoryName",
	description: "description",
	amount: "amount",
} as const;

function SortHeader({
	column,
	label,
	sort,
	dir,
	onSortChange,
}: {
	column: MutationSortColumn;
	label: string;
	sort: MutationSortColumn;
	dir: MutationSortDir;
	onSortChange: (column: MutationSortColumn) => void;
}): React.JSX.Element {
	const active = sort === column;
	let Icon = CaretUpDownIcon;
	if (active) {
		Icon = dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
	}
	const state = active
		? `sorted ${dir === "asc" ? "ascending" : "descending"}`
		: "not sorted";

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="-ml-2 font-medium text-kumo-subtle max-md:h-11"
			onClick={() => onSortChange(column)}
		>
			{label}
			<Icon className="ml-1" size={16} />
			<span className="sr-only">{state}</span>
		</Button>
	);
}

export function getMutationColumns({
	formatCurrency,
	sort,
	dir,
	onSortChange,
}: Options): ColumnDef<MutationRow>[] {
	return [
		{
			accessorKey: MUTATION_COLUMN_ID.date,
			header: () => (
				<SortHeader
					column="date"
					label="Date"
					sort={sort}
					dir={dir}
					onSortChange={onSortChange}
				/>
			),
			cell: ({ row }) => (
				<div className="whitespace-nowrap">
					{format(asUtcDay(row.original.date), "MMM d, yyyy")}
				</div>
			),
		},
		{
			accessorKey: MUTATION_COLUMN_ID.type,
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary">
					{row.original.type === "income" ? "Income" : "Expense"}
				</Badge>
			),
		},
		{
			accessorKey: MUTATION_COLUMN_ID.category,
			header: "Category",
			cell: ({ row }) => (
				<CategoryBadge
					name={row.original.categoryName}
					color={row.original.categoryColor ?? undefined}
				/>
			),
		},
		{
			accessorKey: MUTATION_COLUMN_ID.description,
			header: "Description",
			cell: ({ row }) => (
				<div className="min-w-0 truncate font-medium md:max-w-75">
					{row.original.description || "—"}
				</div>
			),
		},
		{
			accessorKey: MUTATION_COLUMN_ID.amount,
			header: () => (
				<div className="flex justify-end">
					<SortHeader
						column="amount"
						label="Amount"
						sort={sort}
						dir={dir}
						onSortChange={onSortChange}
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex justify-end">
					<SignedAmount
						amount={Number.parseFloat(row.original.amount)}
						formatCurrency={formatCurrency}
						direction={row.original.type === "income" ? "positive" : "negative"}
						size="inline"
					/>
				</div>
			),
		},
	];
}
