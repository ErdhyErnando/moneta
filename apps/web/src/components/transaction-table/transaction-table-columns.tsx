import { Button, Checkbox } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CategoryBadge } from "@/components/category-badge";
import { SignedAmount } from "@/components/money/signed-amount";
import { asUtcDay } from "@/lib/date";
import type { Transaction } from "./transaction-table";

/**
 * Column ids the two layouts read by name: the table renders every visible
 * cell, while the stacked (<md) row picks the same cells into a card. Keep
 * these ids stable — renaming one silently drops that field from mobile.
 */
export const COLUMN_ID = {
	select: "select",
	date: "date",
	category: "category",
	description: "description",
	amount: "amount",
	actions: "actions",
} as const;

export function getTransactionTableColumns(
	formatCurrency: (amount: number) => string,
	type: "income" | "expense",
	onEdit?: (transaction: Transaction) => void,
	onDelete?: (transaction: Transaction) => void,
): ColumnDef<Transaction>[] {
	return [
		{
			id: COLUMN_ID.select,
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
						/* kumo's own recipe for a 44px touch target around a 16px box. */
						className="before:-inset-3.5 relative before:absolute before:content-['']"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => (
				<div className="whitespace-nowrap">
					{format(asUtcDay(row.getValue("date")), "MMM d, yyyy")}
				</div>
			),
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
				<div className="min-w-0 truncate font-medium md:max-w-75">
					{(row.getValue("description") as string) || "—"}
				</div>
			),
		},
		{
			accessorKey: "amount",
			header: () => <div className="text-right">Amount</div>,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<SignedAmount
						amount={Number.parseFloat(row.original.amount)}
						formatCurrency={formatCurrency}
						direction={type === "income" ? "positive" : "negative"}
						size="inline"
					/>
				</div>
			),
		},
		{
			id: COLUMN_ID.actions,
			header: () => <span className="sr-only">Actions</span>,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<DropdownMenu>
						<DropdownMenu.Trigger>
							<Button
								variant="ghost"
								size="sm"
								shape="square"
								aria-label="Open menu"
								className="max-md:size-11"
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
				</div>
			),
		},
	];
}
