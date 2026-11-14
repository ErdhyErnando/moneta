import { Banner, Button, Table } from "@cloudflare/kumo";
import {
	ArrowClockwiseIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ReceiptIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import {
	flexRender,
	getCoreRowModel,
	type Row,
	type Table as TanStackTable,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { EmptyState } from "@/components/layout";
import { useCurrency } from "@/contexts/currency-context";
import type { MutationRow } from "@/lib/mutations";
import {
	getMutationColumns,
	MUTATION_COLUMN_ID,
	type MutationSortColumn,
	type MutationSortDir,
} from "./mutations-columns";

type Props = {
	mutations: MutationRow[];
	isLoading: boolean;
	isError?: boolean;
	onRetry?: () => void;
	sort: MutationSortColumn;
	dir: MutationSortDir;
	onSortChange: (column: MutationSortColumn) => void;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

const TABLE_CLASSES =
	"[&_td]:py-2 [&_th]:border-kumo-hairline [&_th]:text-kumo-subtle [&_th]:text-sm";

/** Renders one cell of a row from the parent table instance, by column id. */
function createCellRenderer(row: Row<MutationRow>) {
	const cells = row.getVisibleCells();
	return (id: string): React.ReactNode => {
		const cell = cells.find((candidate) => candidate.column.id === id);
		return cell
			? flexRender(cell.column.columnDef.cell, cell.getContext())
			: null;
	};
}

/**
 * Stacked row for `<md` (docs/design.md §7.5). It reads the same cells as the
 * table, so it can never drift from the desktop columns.
 */
function StackedMutationRow({
	row,
}: {
	row: Row<MutationRow>;
}): React.JSX.Element {
	const cell = createCellRenderer(row);

	return (
		<li className="flex items-start gap-3 py-2">
			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<div className="min-w-0 flex-1">
						{cell(MUTATION_COLUMN_ID.description)}
					</div>
					<div className="shrink-0">{cell(MUTATION_COLUMN_ID.type)}</div>
				</div>
				<div className="flex flex-wrap items-center gap-2 text-kumo-subtle text-sm">
					{cell(MUTATION_COLUMN_ID.date)}
					{cell(MUTATION_COLUMN_ID.category)}
				</div>
			</div>
			<div className="shrink-0 pt-0.5">{cell(MUTATION_COLUMN_ID.amount)}</div>
		</li>
	);
}

export function MutationsTable({
	mutations,
	isLoading,
	isError = false,
	onRetry,
	sort,
	dir,
	onSortChange,
}: Props): React.JSX.Element {
	const { formatCurrency } = useCurrency();
	const columns = React.useMemo(
		() => getMutationColumns({ formatCurrency, sort, dir, onSortChange }),
		[formatCurrency, sort, dir, onSortChange],
	);

	// Server-side pagination + sorting: the table only renders the current page.
	const table = useReactTable({
		data: mutations,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => `${row.type}-${row.id}`,
	});

	if (isError) {
		return (
			<Banner
				variant="error"
				icon={<WarningCircleIcon size={16} />}
				title="Could not load mutations"
				description="The ledger for this query did not load."
				action={
					onRetry ? (
						<Banner.Action
							variant="secondary"
							icon={<ArrowClockwiseIcon size={16} />}
							onClick={onRetry}
						>
							Retry
						</Banner.Action>
					) : undefined
				}
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-2 rounded-xl border border-kumo-hairline bg-kumo-base p-4">
				{SKELETON_ROWS.map((row) => (
					<div
						key={row}
						className="h-10 w-full animate-pulse rounded bg-kumo-fill"
					/>
				))}
			</div>
		);
	}

	return <MutationsTableBody table={table} />;
}

function MutationsTableBody({
	table,
}: {
	table: TanStackTable<MutationRow>;
}): React.JSX.Element {
	return (
		<div className="overflow-hidden rounded-xl border border-kumo-hairline bg-kumo-base">
			<div className="hidden md:block">
				<Table className={TABLE_CLASSES}>
					<Table.Header>
						{table.getHeaderGroups().map((headerGroup) => (
							<Table.Row key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<Table.Head key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</Table.Head>
								))}
							</Table.Row>
						))}
					</Table.Header>
					<Table.Body>
						{table.getRowModel().rows.length === 0 ? (
							<Table.Row>
								<Table.Cell
									colSpan={table.getAllColumns().length}
									className="p-0"
								>
									<EmptyState
										icon={<ReceiptIcon size={20} />}
										title="No mutations found"
										description="Nothing matches this query. Try a wider date range or clear the filters."
									/>
								</Table.Cell>
							</Table.Row>
						) : (
							table.getRowModel().rows.map((row) => (
								<Table.Row key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<Table.Cell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</Table.Cell>
									))}
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table>
			</div>

			{table.getRowModel().rows.length === 0 ? (
				<div className="md:hidden">
					<EmptyState
						icon={<ReceiptIcon size={20} />}
						title="No mutations found"
						description="Nothing matches this query. Try a wider date range or clear the filters."
					/>
				</div>
			) : (
				<ul className="divide-y divide-kumo-hairline px-4 md:hidden">
					{table.getRowModel().rows.map((row) => (
						<StackedMutationRow key={row.id} row={row} />
					))}
				</ul>
			)}
		</div>
	);
}

type PaginationProps = {
	page: number;
	totalPages: number;
	total: number;
	onPageChange: (page: number) => void;
};

export function MutationsPagination({
	page,
	totalPages,
	total,
	onPageChange,
}: PaginationProps): React.JSX.Element {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-kumo-subtle text-sm tabular-nums">
				{total} mutation{total === 1 ? "" : "s"} total
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-kumo-subtle text-sm tabular-nums">
					Page {page} of {totalPages}
				</p>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to previous page"
					className="max-md:size-11"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					icon={<CaretLeftIcon size={16} />}
				/>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to next page"
					className="max-md:size-11"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					icon={<CaretRightIcon size={16} />}
				/>
			</div>
		</div>
	);
}
