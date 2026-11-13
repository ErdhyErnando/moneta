import { Button, Checkbox } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { z } from "zod";
import { CategoryBadge } from "@/components/category-badge";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { DataTableShell } from "@/components/data-table-shell";
import { useCurrency } from "@/contexts/currency-context";
import { asUtcDay } from "@/lib/date";

const schema = z.object({
	id: z.number(),
	date: z.string(),
	description: z.string(),
	category: z.string(),
	categoryColor: z.string().optional(),
	amount: z.number(),
	type: z.enum(["income", "expense"]),
});

export type Transaction = z.infer<typeof schema>;

const columns: ColumnDef<Transaction>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					indeterminate={
						table.getIsSomePageRowsSelected() &&
						!table.getIsAllPageRowsSelected()
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			const date = asUtcDay(row.getValue("date"));
			return <div className="font-medium">{date.toLocaleDateString()}</div>;
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => (
			<div className="max-w-[200px] truncate font-medium">
				{row.getValue("description")}
			</div>
		),
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => {
			const category = row.getValue("category") as string;
			const color = (row.original as { categoryColor?: string }).categoryColor;
			return <CategoryBadge name={category} color={color} />;
		},
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<span
					className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-xs ${
						type === "income"
							? "bg-kumo-success-tint text-positive"
							: "bg-kumo-danger-tint text-negative"
					}`}
				>
					{type.charAt(0).toUpperCase() + type.slice(1)}
				</span>
			);
		},
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row, table }) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			const type = row.original.type;
			// Access formatCurrency from table meta
			const formatCurrency = (
				table.options.meta as { formatCurrency: (amount: number) => string }
			)?.formatCurrency;
			const formatted = formatCurrency
				? formatCurrency(amount)
				: `$${amount.toFixed(2)}`;

			return (
				<div
					className={`text-right font-medium tabular-nums ${
						type === "income" ? "text-positive" : "text-negative"
					}`}
				>
					{type === "income" ? "+" : "-"}
					{formatted}
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: () => (
			<DropdownMenu>
				<DropdownMenu.Trigger>
					<Button
						variant="ghost"
						size="sm"
						shape="square"
						aria-label="Open menu"
						icon={<DotsThreeVerticalIcon size={16} />}
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" className="w-32">
					<DropdownMenu.Item>Edit</DropdownMenu.Item>
					<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item variant="danger">Delete</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
		),
	},
];

function DataTableComponent({ data }: { data: Transaction[] }) {
	const { formatCurrency } = useCurrency();
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		meta: {
			formatCurrency,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<DataTableShell
			table={table}
			colCount={columns.length}
			addControl={<AddTransactionDialog />}
		/>
	);
}

export { DataTableComponent as DataTable };
