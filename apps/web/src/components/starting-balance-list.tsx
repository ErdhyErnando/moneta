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

import { DataTableShell } from "@/components/data-table-shell";
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
			<div className="max-w-50 truncate font-medium">
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

			// A starting balance is a balance, not P&L: neutral colour, no sign
			// (docs/design.md §2.4 — only P&L carries sign + arrow + direction).
			return (
				<div className="text-right font-medium tabular-nums">{formatted}</div>
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
						<DropdownMenu.Item onClick={() => meta?.onEdit(row.original)}>
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							variant="danger"
							onClick={() => meta?.onDelete(row.original)}
						>
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu>
			);
		},
	},
];

/**
 * `<md` row: selection, description, date + category and the amount, with the
 * same menu actions as the table row (docs/design.md §7.5).
 */
function StartingBalanceStackedRow({
	balance,
	selected,
	onToggle,
	onEdit,
	onDelete,
}: {
	balance: StartingBalance;
	selected: boolean;
	onToggle: () => void;
	onEdit?: (balance: StartingBalance) => void;
	onDelete?: (balance: StartingBalance) => void;
}): React.JSX.Element {
	const { formatCurrency } = useCurrency();

	return (
		<li className="flex items-start gap-2 px-4 py-2">
			<div className="pt-1">
				<Checkbox
					checked={selected}
					onCheckedChange={onToggle}
					aria-label="Select row"
				/>
			</div>
			<div className="min-w-0 flex-1 space-y-1">
				<div className="truncate font-medium">{balance.description}</div>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-kumo-subtle text-sm">
						{asUtcDay(balance.date).toLocaleDateString()}
					</span>
					<CategoryBadge
						name={balance.category.name}
						color={balance.category.color}
					/>
				</div>
				<div className="font-medium tabular-nums">
					{formatCurrency(Number.parseFloat(balance.amount))}
				</div>
			</div>
			<DropdownMenu>
				<DropdownMenu.Trigger>
					<Button
						variant="ghost"
						size="sm"
						shape="square"
						aria-label="Open menu"
						className="size-11 md:size-6.5"
						icon={<DotsThreeVerticalIcon size={16} />}
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" className="w-32">
					<DropdownMenu.Item onClick={() => onEdit?.(balance)}>
						Edit
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						variant="danger"
						onClick={() => onDelete?.(balance)}
					>
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>
		</li>
	);
}

interface StartingBalanceListProps {
	data: StartingBalance[];
	onEdit?: (balance: StartingBalance) => void;
	onDelete?: (balance: StartingBalance) => void;
}

export function StartingBalanceList({
	data,
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

	const meta = {
		onEdit,
		onDelete,
	} as {
		onEdit?: (balance: StartingBalance) => void;
		onDelete?: (balance: StartingBalance) => void;
	};

	return (
		<DataTableShell
			table={table}
			colCount={columns.length}
			renderStackedRow={(row) => (
				<StartingBalanceStackedRow
					key={row.id}
					balance={row.original}
					selected={row.getIsSelected()}
					onToggle={() => row.toggleSelected()}
					onEdit={meta.onEdit}
					onDelete={meta.onDelete}
				/>
			)}
		/>
	);
}
