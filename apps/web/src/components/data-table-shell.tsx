import { Button, Input, Select } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	CaretDownIcon,
	CaretLeftIcon,
	CaretLineLeftIcon,
	CaretLineRightIcon,
	CaretRightIcon,
	ColumnsIcon,
} from "@phosphor-icons/react";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type DataTableShellProps<TData> = {
	table: TanStackTable<TData>;
	colCount: number;
	addControl: ReactNode;
};

// Shared toolbar + table + pagination chrome for the dashboard transactions
// table and the starting-balance list (#49). Only columns, data and the add
// control differ per table, so those stay with the callers.
export function DataTableShell<TData>({
	table,
	colCount,
	addControl,
}: DataTableShellProps<TData>) {
	return (
		<div className="w-full space-y-4">
			<div className="flex items-center justify-between">
				<Input
					aria-label="Filter descriptions"
					placeholder="Filter descriptions..."
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn("description")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenu.Trigger>
							<Button
								variant="secondary"
								size="sm"
								icon={<ColumnsIcon size={16} />}
							>
								Columns
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
			<div className="rounded-xl border border-kumo-hairline">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
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
								<TableCell colSpan={colCount} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between px-2">
				<div className="flex-1 text-kumo-subtle text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="font-medium text-sm">Rows per page</p>
						<Select
							size="sm"
							className="w-[70px]"
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
					<div className="flex w-[100px] items-center justify-center font-medium text-sm">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount() || 1}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to first page"
							className="hidden lg:inline-flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							icon={<CaretLineLeftIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to previous page"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							icon={<CaretLeftIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to next page"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							icon={<CaretRightIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to last page"
							className="hidden lg:inline-flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
							icon={<CaretLineRightIcon size={16} />}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
