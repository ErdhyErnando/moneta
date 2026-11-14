import { Button, Input, Select, Table } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	CaretDownIcon,
	CaretLeftIcon,
	CaretLineLeftIcon,
	CaretLineRightIcon,
	CaretRightIcon,
	ColumnsIcon,
	ReceiptIcon,
} from "@phosphor-icons/react";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/layout";

type DataTableShellProps<TData> = {
	table: TanStackTable<TData>;
	colCount: number;
	addControl: ReactNode;
};

const TABLE_CLASSES =
	"[&_td]:py-2 [&_th]:border-kumo-hairline [&_th]:text-kumo-subtle [&_th]:text-sm";

/**
 * Shared toolbar + table + pagination chrome (#49), styled to the
 * docs/design.md §7.5 recipe: hairline shell, `text-sm` muted header, 40px
 * rows, zebra from kumo's `Table.Row`, in-shell empty state.
 *
 * Only columns, data and the add control differ per caller, so those stay there.
 */
export function DataTableShell<TData>({
	table,
	colCount,
	addControl,
}: DataTableShellProps<TData>): React.JSX.Element {
	const rows = table.getRowModel().rows;

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Input
					aria-label="Filter descriptions"
					placeholder="Filter descriptions..."
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn("description")?.setFilterValue(event.target.value)
					}
					className="max-w-sm max-md:h-11"
				/>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenu.Trigger>
							<Button
								variant="secondary"
								size="sm"
								icon={<ColumnsIcon size={16} />}
								aria-label="Columns"
								className="max-sm:size-11 max-md:h-11"
							>
								<span className="hidden sm:inline">Columns</span>
								<CaretDownIcon className="ml-2" size={16} />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" className="w-56">
							{table.getAllColumns().flatMap((column) =>
								typeof column.accessorFn !== "undefined" && column.getCanHide()
									? [
											<DropdownMenu.CheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) =>
													column.toggleVisibility(!!value)
												}
											>
												{column.id}
											</DropdownMenu.CheckboxItem>,
										]
									: [],
							)}
						</DropdownMenu.Content>
					</DropdownMenu>
					{addControl}
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border border-kumo-hairline bg-kumo-base">
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
						{rows.length === 0 ? (
							<Table.Row>
								<Table.Cell colSpan={colCount} className="p-0">
									<EmptyState
										icon={<ReceiptIcon size={20} />}
										title="No rows"
										description="Nothing matches this filter."
									/>
								</Table.Cell>
							</Table.Row>
						) : (
							rows.map((row) => (
								<Table.Row
									key={row.id}
									variant={row.getIsSelected() ? "selected" : "default"}
								>
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

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-kumo-subtle text-sm tabular-nums">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-2">
						<span className="text-kumo-subtle text-sm">Rows per page</span>
						<Select
							size="sm"
							className="w-20 max-md:h-11"
							aria-label="Rows per page"
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								if (value) table.setPageSize(Number(value));
							}}
							items={[10, 20, 30, 40, 50].map((pageSize) => ({
								label: String(pageSize),
								value: String(pageSize),
							}))}
						/>
					</div>
					<p className="text-kumo-subtle text-sm tabular-nums">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount() || 1}
					</p>
					<Button
						variant="secondary"
						size="sm"
						shape="square"
						aria-label="Go to first page"
						className="max-md:size-11 max-lg:hidden"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
						icon={<CaretLineLeftIcon size={16} />}
					/>
					<Button
						variant="secondary"
						size="sm"
						shape="square"
						aria-label="Go to previous page"
						className="max-md:size-11"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						icon={<CaretLeftIcon size={16} />}
					/>
					<Button
						variant="secondary"
						size="sm"
						shape="square"
						aria-label="Go to next page"
						className="max-md:size-11"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						icon={<CaretRightIcon size={16} />}
					/>
					<Button
						variant="secondary"
						size="sm"
						shape="square"
						aria-label="Go to last page"
						className="max-md:size-11 max-lg:hidden"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
						icon={<CaretLineRightIcon size={16} />}
					/>
				</div>
			</div>
		</div>
	);
}
