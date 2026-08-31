import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
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
			className="-ml-3 h-8 font-medium text-sm"
			onClick={() => onSortChange(column)}
		>
			{label}
			{active ? (
				dir === "asc" ? (
					<ArrowUp className="ml-1 size-3.5" />
				) : (
					<ArrowDown className="ml-1 size-3.5" />
				)
			) : (
				<ChevronsUpDown className="ml-1 size-3.5 opacity-50" />
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
							? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
							: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
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
							"whitespace-nowrap text-right font-medium",
							income ? "text-emerald-600" : "text-rose-600",
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
