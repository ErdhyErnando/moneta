import {
	IconChevronDown,
	IconFilter,
	IconLayoutColumns,
	IconX,
} from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
				<Label htmlFor="description-filter" className="sr-only">
					Filter by description
				</Label>
				<Input
					id="description-filter"
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
					variant={showFilters ? "secondary" : "outline"}
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
				>
					<IconFilter className="mr-2 size-4" />
					Filters
					{hasActiveFilters && (
						<span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
							{table.getState().columnFilters.length}
						</span>
					)}
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<IconLayoutColumns className="mr-2 size-4" />
							<span className="hidden sm:inline">Columns</span>
							<IconChevronDown className="ml-2 size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{table
							.getAllColumns()
							.filter(
								(column) =>
									typeof column.accessorFn !== "undefined" &&
									column.getCanHide(),
							)
							.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export function ClearButton({ onClick }: { onClick: () => void }) {
	return (
		<Button variant="ghost" size="sm" onClick={onClick} className="h-8">
			<IconX className="mr-1 size-4" />
			Clear
		</Button>
	);
}
