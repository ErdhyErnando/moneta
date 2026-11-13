import { Button } from "@cloudflare/kumo";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CaretUpDownIcon,
} from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CategoryBadge } from "@/components/category-badge";
import { asUtcDay } from "@/lib/date";
import type { MutationRow } from "@/lib/mutations";
import { cn } from "@/lib/utils";

export type MutationSortColumn = "date" | "amount";
export type MutationSortDir = "asc" | "desc";

type Options = {
	formatCurrency: (amount: number) => string;
	sort: MutationSortColumn;
	dir: MutationSortDir;
	onSortChange: (column: MutationSortColumn) => void;
};

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
}) {
	const active = sort === column;
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			className="-ml-3 font-medium"
			onClick={() => onSortChange(column)}
		>
			{label}
			{active ? (
				dir === "asc" ? (
					<ArrowUpIcon className="ml-1" size={14} />
				) : (
					<ArrowDownIcon className="ml-1" size={14} />
				)
			) : (
				<CaretUpDownIcon className="ml-1 opacity-50" size={14} />
			)}
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
			accessorKey: "date",
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
				<div className="whitespace-nowrap font-medium">
					{format(asUtcDay(row.original.date), "MMM d, yyyy")}
				</div>
			),
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<span
					className={cn(
						"inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-xs",
						row.original.type === "income"
							? "bg-kumo-success-tint text-positive"
							: "bg-kumo-danger-tint text-negative",
					)}
				>
					{row.original.type === "income" ? "Income" : "Expense"}
				</span>
			),
		},
		{
			accessorKey: "categoryName",
			header: "Category",
			cell: ({ row }) => (
				<CategoryBadge
					name={row.original.categoryName}
					color={row.original.categoryColor ?? undefined}
				/>
			),
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<div className="max-w-[200px] truncate font-medium md:max-w-[300px]">
					{row.original.description || "-"}
				</div>
			),
		},
		{
			accessorKey: "amount",
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
			cell: ({ row }) => {
				const amount = Number.parseFloat(row.original.amount);
				const income = row.original.type === "income";
				return (
					<div
						className={cn(
							"whitespace-nowrap text-right font-medium tabular-nums",
							income ? "text-positive" : "text-negative",
						)}
					>
						{income ? "+" : "-"}
						{formatCurrency(amount)}
					</div>
				);
			},
		},
	];
}
