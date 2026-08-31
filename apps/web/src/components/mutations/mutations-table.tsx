import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
	flexRender,
	getCoreRowModel,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "@/components/ui/button";
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
		<div className="overflow-x-auto rounded-md border">
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
								className="h-24 text-center text-muted-foreground"
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
			<div className="text-muted-foreground text-sm">
				{total} mutation{total === 1 ? "" : "s"} total
			</div>
			<div className="flex items-center gap-2">
				<div className="flex w-[120px] items-center justify-center font-medium text-sm">
					Page {page} of {totalPages}
				</div>
				<Button
					variant="outline"
					className="h-8 w-8 p-0"
					onClick={() => onPageChange(page - 1)}
					disabled={page <= 1}
				>
					<span className="sr-only">Go to previous page</span>
					<IconChevronLeft className="size-4" />
				</Button>
				<Button
					variant="outline"
					className="h-8 w-8 p-0"
					onClick={() => onPageChange(page + 1)}
					disabled={page >= totalPages}
				>
					<span className="sr-only">Go to next page</span>
					<IconChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
