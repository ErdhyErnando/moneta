import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
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

import { DataTableShell } from "@/components/data-table-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/contexts/currency-context";
import { asUtcDay } from "@/lib/date";

const startingBalanceSchema = z.object({
	id: z.number(),
	date: z.string(),
	description: z.string(),
	categoryId: z.number(),
	category: z.object({
		id: z.number(),
		name: z.string(),
		color: z.string().optional(),
	}),
	amount: z.string(),
});

export type StartingBalance = z.infer<typeof startingBalanceSchema>;

const columns: ColumnDef<StartingBalance>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
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
			const category = row.original.category;
			return <CategoryBadge name={category.name} color={category.color} />;
		},
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row, table }) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			// Access formatCurrency from table meta
			const formatCurrency = (
				table.options.meta as { formatCurrency: (amount: number) => string }
			)?.formatCurrency;
			const formatted = formatCurrency
				? formatCurrency(amount)
				: `$${amount.toFixed(2)}`;

			return (
				<div className="text-right font-medium text-blue-600">+{formatted}</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as {
				onEdit: (balance: StartingBalance) => void;
				onDelete: (balance: StartingBalance) => void;
			};

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
							size="icon"
						>
							<IconDotsVertical className="size-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-32">
						<DropdownMenuItem onClick={() => meta?.onEdit(row.original)}>
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => meta?.onDelete(row.original)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

interface StartingBalanceListProps {
	data: StartingBalance[];
	onAddClick?: () => void;
	onEdit?: (balance: StartingBalance) => void;
	onDelete?: (balance: StartingBalance) => void;
}

export function StartingBalanceList({
	data,
	onAddClick,
	onEdit,
	onDelete,
}: StartingBalanceListProps) {
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
			onEdit,
			onDelete,
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
			addControl={
				<Button size="sm" onClick={onAddClick}>
					<IconPlus className="mr-2 size-4" />
					Add Starting Balance
				</Button>
			}
		/>
	);
}
