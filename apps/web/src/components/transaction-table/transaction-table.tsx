import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Accordion } from "@/components/ui/accordion";
import { useCurrency } from "@/contexts/currency-context";
import { getTransactionTableColumns } from "./transaction-table-columns";
import { TransactionTableFilters } from "./transaction-table-filters";
import { TransactionTableMonthGroup } from "./transaction-table-month-group";
import { TransactionTablePagination } from "./transaction-table-pagination";
import { TransactionTableToolbar } from "./transaction-table-toolbar";
import { groupRowsByUtcMonth, MONTHS_PER_PAGE } from "./use-monthly-groups";
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

/**
 * #32: rows are grouped into UTC-month accordion sections. Filtering/sorting
 * keep working (they narrow/re-order rows inside groups; empty months drop
 * out). Pagination is group-based: MONTHS_PER_PAGE months per page, so a month
 * is never split across pages.
 */
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
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const sortedRows = table.getSortedRowModel().rows;
	const groups = React.useMemo(
		() => groupRowsByUtcMonth(sortedRows),
		[sortedRows],
	);

	const pageCount = Math.max(1, Math.ceil(groups.length / MONTHS_PER_PAGE));
	const [monthPageIndex, setMonthPageIndex] = React.useState(0);
	// Clamp instead of an effect so filter changes never render an empty page.
	const pageIndex = Math.min(monthPageIndex, pageCount - 1);
	const pageGroups = groups.slice(
		pageIndex * MONTHS_PER_PAGE,
		pageIndex * MONTHS_PER_PAGE + MONTHS_PER_PAGE,
	);

	// Default: current UTC month expanded, everything else collapsed (#32).
	const [expandedOverride, setExpandedOverride] = React.useState<
		string[] | null
	>(null);
	const defaultExpandedKey =
		groups.find((g) => g.key === new Date().toISOString().slice(0, 7))?.key ??
		groups[0]?.key;
	const expanded =
		expandedOverride ?? (defaultExpandedKey ? [defaultExpandedKey] : []);

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
			{isLoading ? (
				<div className="rounded-md border py-12 text-center text-muted-foreground">
					Loading...
				</div>
			) : groups.length === 0 ? (
				<div className="rounded-md border py-12 text-center text-muted-foreground">
					No {type === "income" ? "incomes" : "expenses"} found.
				</div>
			) : (
				<Accordion
					type="multiple"
					value={expanded}
					onValueChange={(value) =>
						setExpandedOverride(
							Array.isArray(value) ? value : value ? [value] : [],
						)
					}
					className="space-y-3"
				>
					{pageGroups.map((group) => (
						<TransactionTableMonthGroup
							key={group.key}
							group={group}
							table={table}
							type={type}
							formatCurrency={formatCurrency}
						/>
					))}
				</Accordion>
			)}
			<TransactionTablePagination
				selectedCount={table.getFilteredSelectedRowModel().rows.length}
				totalMonths={groups.length}
				pageIndex={pageIndex}
				pageCount={pageCount}
				onFirst={() => setMonthPageIndex(0)}
				onPrevious={() => setMonthPageIndex(Math.max(0, pageIndex - 1))}
				onNext={() => setMonthPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
				onLast={() => setMonthPageIndex(pageCount - 1)}
			/>
		</div>
	);
}
