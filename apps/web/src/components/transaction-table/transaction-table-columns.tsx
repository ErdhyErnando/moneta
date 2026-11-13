import { Button, Checkbox } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CategoryBadge } from "@/components/category-badge";
import { asUtcDay } from "@/lib/date";
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
						checked={table.getIsAllRowsSelected()}
						indeterminate={
							table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
						}
						onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
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
				const date = asUtcDay(row.getValue("date"));
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
							type === "income" ? "text-positive" : "text-negative",
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
					<DropdownMenu.Trigger>
						<Button
							variant="ghost"
							size="sm"
							shape="square"
							aria-label="Open menu"
							icon={<DotsThreeVerticalIcon size={16} />}
						/>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" className="w-32">
						<DropdownMenu.Item onClick={() => onEdit?.(row.original)}>
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							variant="danger"
							onClick={() => onDelete?.(row.original)}
						>
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu>
			),
		},
	];
}
