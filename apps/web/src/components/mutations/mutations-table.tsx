import { Button } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
	flexRender,
	getCoreRowModel,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Table as UITable,
} from "@/components/ui/table";
import { useCurrency } from "@/contexts/currency-context";
import type { MutationRow } from "@/lib/mutations";
import {
	getMutationColumns,
	type MutationSortColumn,
	type MutationSortDir,
} from "./mutations-columns";

type Props = {
	mutations: MutationRow[];
	isLoading: boolean;
	sort: MutationSortColumn;
	dir: MutationSortDir;
	onSortChange: (column: MutationSortColumn) => void;
};

export function MutationsTable({
	mutations,
	isLoading,
	sort,
	dir,
	onSortChange,
}: Props) {
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

	return <MutationsTableBody table={table} isLoading={isLoading} />;
}

function MutationsTableBody({
	table,
	isLoading,
}: {
	table: Table<MutationRow>;
	isLoading: boolean;
}) {
	return (
		<div className="overflow-x-auto rounded-xl border border-kumo-hairline">
			<UITable>
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
								colSpan={table.getAllColumns().length}
								className="h-24 text-center"
							>
								Loading...
							</TableCell>
						</TableRow>
					) : table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center text-kumo-subtle"
							>
								No mutations for this period.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</UITable>
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
}: PaginationProps) {
	return (
		<div className="flex flex-col gap-4 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="text-kumo-subtle text-sm">
				{total} mutation{total === 1 ? "" : "s"} total
			</div>
			<div className="flex items-center gap-2">
				<div className="flex w-[120px] items-center justify-center font-medium text-sm">
					Page {page} of {totalPages}
				</div>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to previous page"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
					icon={<CaretLeftIcon size={16} />}
				/>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to next page"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
					icon={<CaretRightIcon size={16} />}
				/>
			</div>
		</div>
	);
}
