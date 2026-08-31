import { flexRender, type Table } from "@tanstack/react-table";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Table as UITable,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Transaction } from "./transaction-table";
import type { MonthlyGroup } from "./use-monthly-groups";

type Props = {
	group: MonthlyGroup<Transaction>;
	table: Table<Transaction>;
	type: "income" | "expense";
	formatCurrency: (amount: number) => string;
};

/**
 * One UTC-month accordion section (#32).
 *
 * Header shows `February 2026 — total +Rp 3.200.000 (12 transactions)`.
 * Content reuses the parent table instance's columns/rows, so sorting, column
 * visibility and the edit/delete dropdown behave exactly as before; the rows
 * come from `getSortedRowModel()` and are simply bucketed by month.
 */
export function TransactionTableMonthGroup({
	group,
	table,
	type,
	formatCurrency,
}: Props) {
	return (
		<AccordionItem value={group.key} className="rounded-md border">
			<AccordionTrigger className="px-4 hover:no-underline">
				<div className="flex flex-1 items-center justify-between gap-4 pr-2">
					<span className="font-semibold text-sm">{group.label}</span>
					<span
						className={cn(
							"flex items-center gap-2 text-sm",
							type === "income" ? "text-emerald-600" : "text-rose-600",
						)}
					>
						total {type === "income" ? "+" : "-"}
						{formatCurrency(group.total)}
						<span className="text-muted-foreground">
							({group.rows.length} transaction
							{group.rows.length === 1 ? "" : "s"})
						</span>
					</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-2">
				<div className="overflow-x-auto rounded-md border">
					<UITable>
						<TableHeader>
							<TableRow key={`header-${group.key}`}>
								{table.getHeaderGroups()[0]?.headers.map((header) => (
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
						</TableHeader>
						<TableBody>
							{group.rows.map((row) => (
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
							))}
						</TableBody>
					</UITable>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
