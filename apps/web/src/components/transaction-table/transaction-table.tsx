import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/contexts/currency-context";
import { getTransactionTableColumns } from "./transaction-table-columns";
import { TransactionTableFilters } from "./transaction-table-filters";
import { TransactionTablePagination } from "./transaction-table-pagination";
import { TransactionTableToolbar } from "./transaction-table-toolbar";
import { useTransactionFilters } from "./use-transaction-filters";
import { useTransactionTableState } from "./use-transaction-table-state";

export type Transaction = {
	id: number;
	amount: string;
	description: string;
	date: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
		type: "income" | "expense";
		color: string;
	};
};

type Props = {
	data: Transaction[];
	type: "income" | "expense";
	isLoading?: boolean;
	onEdit?: (t: Transaction) => void;
	onDelete?: (t: Transaction) => void;
};

export function TransactionTable({
	data,
	type,
	isLoading = false,
	onEdit,
	onDelete,
}: Props) {
	const { formatCurrency } = useCurrency();
	const { state, dispatch } = useTransactionTableState();
	const filters = useTransactionFilters(data, type);
	const columns = React.useMemo(
		() => getTransactionTableColumns(formatCurrency, type, onEdit, onDelete),
		[formatCurrency, type, onEdit, onDelete],
	);

	const table = useReactTable({
		data: filters.filteredData,
		columns,
		state: {
			sorting: state.sorting,
			columnVisibility: state.columnVisibility,
			rowSelection: state.rowSelection,
			columnFilters: state.columnFilters,
			pagination: state.pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			const value =
				typeof updater === "function" ? updater(state.rowSelection) : updater;
			dispatch({
				type: "setRowSelection",
				payload: value as Record<string, boolean>,
			});
		},
		onSortingChange: (updater) => {
			const value =
				typeof updater === "function" ? updater(state.sorting) : updater;
			dispatch({ type: "setSorting", payload: value as never });
		},
		onColumnFiltersChange: (updater) => {
			const value =
				typeof updater === "function" ? updater(state.columnFilters) : updater;
			dispatch({ type: "setColumnFilters", payload: value as never });
		},
		onColumnVisibilityChange: (updater) => {
			const value =
				typeof updater === "function"
					? updater(state.columnVisibility)
					: updater;
			dispatch({ type: "setColumnVisibility", payload: value as never });
		},
		onPaginationChange: (updater) => {
			const value =
				typeof updater === "function" ? updater(state.pagination) : updater;
			dispatch({ type: "setPagination", payload: value as never });
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-col gap-4">
				<TransactionTableToolbar
					table={table}
					showFilters={filters.showFilters}
					setShowFilters={filters.setShowFilters}
					hasActiveFilters={filters.hasActiveFilters as boolean}
				/>
				{filters.showFilters && (
					<TransactionTableFilters
						startDate={filters.startDate}
						setStartDate={filters.setStartDate}
						endDate={filters.endDate}
						setEndDate={filters.setEndDate}
						selectedCategory={filters.selectedCategory}
						setSelectedCategory={filters.setSelectedCategory}
						minAmount={filters.minAmount}
						setMinAmount={filters.setMinAmount}
						maxAmount={filters.maxAmount}
						setMaxAmount={filters.setMaxAmount}
						categories={filters.categories}
						hasActiveFilters={filters.hasActiveFilters as boolean}
						clearFilters={filters.clearFilters}
					/>
				)}
			</div>
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((hg) => (
							<TableRow key={hg.id}>
								{hg.headers.map((header) => (
									<TableHead key={header.id} className="whitespace-nowrap">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Loading...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No {type === "income" ? "incomes" : "expenses"} found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<TransactionTablePagination table={table} />
		</div>
	);
}
