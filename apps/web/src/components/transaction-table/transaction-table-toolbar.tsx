import { Badge, Button, Input } from "@cloudflare/kumo";
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
}: Props): React.JSX.Element {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
				className="max-w-sm max-md:h-11"
			/>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant={showFilters ? "secondary" : "ghost"}
					size="sm"
					icon={<FunnelIcon size={16} />}
					className="max-md:h-11"
					onClick={() => setShowFilters(!showFilters)}
				>
					Filters
					{hasActiveFilters && (
						<Badge variant="secondary" className="ml-1">
							{table.getState().columnFilters.length}
						</Badge>
					)}
				</Button>
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
							<CaretDownIcon className="ml-2 hidden sm:inline" size={16} />
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

export function ClearButton({
	onClick,
}: {
	onClick: () => void;
}): React.JSX.Element {
	return (
		<Button
			variant="ghost"
			size="sm"
			icon={<XIcon size={16} />}
			className="max-md:h-11"
			onClick={onClick}
		>
			Clear
		</Button>
	);
}
