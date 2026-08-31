import { IconDotsVertical } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Transaction } from "./transaction-table";

export function getTransactionTableColumns(
	formatCurrency: (amount: number) => string,
	type: "income" | "expense",
	onEdit?: (transaction: Transaction) => void,
	onDelete?: (transaction: Transaction) => void,
): ColumnDef<Transaction>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => {
				const date = new Date(row.getValue("date") as string);
				return (
					<div className="whitespace-nowrap font-medium">
						{format(date, "MMM d, yyyy")}
					</div>
				);
			},
		},
		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.category;
				return <CategoryBadge name={category.name} color={category.color} />;
			},
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<div className="max-w-[200px] truncate font-medium md:max-w-[300px]">
					{(row.getValue("description") as string) || "-"}
				</div>
			),
		},
		{
			accessorKey: "amount",
			header: () => <div className="text-right">Amount</div>,
			cell: ({ row }) => {
				const amount = Number.parseFloat(row.original.amount);
				const formatted = formatCurrency(amount);
				return (
					<div
						className={cn(
							"whitespace-nowrap text-right font-medium",
							type === "income" ? "text-emerald-600" : "text-rose-600",
						)}
					>
						{type === "income" ? "+" : "-"}
						{formatted}
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
							size="icon"
						>
							<IconDotsVertical className="size-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-32">
						<DropdownMenuItem onClick={() => onEdit?.(row.original)}>
							Edit
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onClick={() => onDelete?.(row.original)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];
}
