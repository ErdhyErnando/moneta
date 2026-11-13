import { Button, Input } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	CaretDownIcon,
	ColumnsIcon,
	FunnelIcon,
	XIcon,
} from "@phosphor-icons/react";
import type { Table } from "@tanstack/react-table";
import type { Transaction } from "./transaction-table";

type Props = {
	table: Table<Transaction>;
	showFilters: boolean;
	setShowFilters: (v: boolean) => void;
	hasActiveFilters: boolean;
};

export function TransactionTableToolbar({
	table,
	showFilters,
	setShowFilters,
	hasActiveFilters,
}: Props) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-col gap-1.5">
				<Input
					id="description-filter"
					aria-label="Filter by description"
					placeholder="Filter descriptions..."
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn("description")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant={showFilters ? "secondary" : "ghost"}
					size="sm"
					icon={<FunnelIcon size={16} />}
					onClick={() => setShowFilters(!showFilters)}
				>
					Filters
					{hasActiveFilters && (
						<span className="ml-1 rounded-full bg-kumo-brand px-1.5 py-0.5 text-[10px] text-kumo-inverse">
							{table.getState().columnFilters.length}
						</span>
					)}
				</Button>
				<DropdownMenu>
					<DropdownMenu.Trigger>
						<Button
							variant="secondary"
							size="sm"
							icon={<ColumnsIcon size={16} />}
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
			</div>
		</div>
	);
}

export function ClearButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			variant="ghost"
			size="sm"
			icon={<XIcon size={16} />}
			onClick={onClick}
		>
			Clear
		</Button>
	);
}
