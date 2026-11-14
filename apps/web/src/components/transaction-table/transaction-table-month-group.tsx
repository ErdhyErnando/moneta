import { Table } from "@cloudflare/kumo";
import {
	flexRender,
	type Row,
	type Table as TanStackTable,
} from "@tanstack/react-table";
import { SignedAmount } from "@/components/money/signed-amount";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/primitives/accordion";
import type { Transaction } from "./transaction-table";
import { COLUMN_ID } from "./transaction-table-columns";
import type { MonthlyGroup } from "./use-monthly-groups";

type Props = {
	group: MonthlyGroup<Transaction>;
	table: TanStackTable<Transaction>;
	type: "income" | "expense";
	formatCurrency: (amount: number) => string;
};

/** Renders one cell of a row from the parent table instance, by column id. */
function createCellRenderer(row: Row<Transaction>) {
	const cells = row.getVisibleCells();
	return (id: string): React.ReactNode => {
		const cell = cells.find((candidate) => candidate.column.id === id);
		return cell
			? flexRender(cell.column.columnDef.cell, cell.getContext())
			: null;
	};
}

/**
 * Stacked row for `<md` (docs/design.md §7.5: tables scroll inside their shell,
 * or switch to a stacked list — this reads better than a clipped six-column
 * table on a 375px screen). It reuses the table's own cells, so filtering,
 * selection, sorting and column visibility all behave identically.
 */
function StackedTransactionRow({
	row,
}: {
	row: Row<Transaction>;
}): React.JSX.Element {
	const cell = createCellRenderer(row);

	return (
		<li className="flex items-start gap-2 py-2">
			<div className="pt-0.5">{cell(COLUMN_ID.select)}</div>
			<div className="min-w-0 flex-1 space-y-1">
				{cell(COLUMN_ID.description)}
				<div className="flex flex-wrap items-center gap-2 text-kumo-subtle text-sm">
					{cell(COLUMN_ID.date)}
					{cell(COLUMN_ID.category)}
				</div>
			</div>
			<div className="shrink-0 pt-0.5">{cell(COLUMN_ID.amount)}</div>
			<div className="shrink-0">{cell(COLUMN_ID.actions)}</div>
		</li>
	);
}

/**
 * One UTC-month section (#32) as a card: header carries the month, the signed
 * total and the row count; the body is a kumo `Table` at `>=md` and a stacked
 * list below it.
 */
export function TransactionTableMonthGroup({
	group,
	table,
	type,
	formatCurrency,
}: Props): React.JSX.Element {
	return (
		<AccordionItem
			value={group.key}
			className="overflow-hidden rounded-xl border border-kumo-hairline bg-kumo-base"
		>
			<AccordionTrigger className="px-4 hover:no-underline">
				<div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<span className="font-semibold text-base text-kumo-strong">
						{group.label}
					</span>
					<span className="flex flex-wrap items-center gap-2 text-sm">
						<SignedAmount
							amount={group.total}
							formatCurrency={formatCurrency}
							direction={type === "income" ? "positive" : "negative"}
							size="inline"
						/>
						<span className="text-kumo-subtle">
							({group.rows.length} transaction
							{group.rows.length === 1 ? "" : "s"})
						</span>
					</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-0">
				<div className="hidden md:block">
					<Table className="[&_td]:py-2 [&_th]:border-kumo-hairline [&_th]:font-medium [&_th]:text-kumo-subtle [&_th]:text-sm">
						<Table.Header>
							<Table.Row>
								{table.getHeaderGroups()[0]?.headers.map((header) => (
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
						</Table.Header>
						<Table.Body>
							{group.rows.map((row) => (
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
							))}
						</Table.Body>
					</Table>
				</div>

				<ul className="divide-y divide-kumo-hairline border-kumo-hairline border-t px-4 md:hidden">
					{group.rows.map((row) => (
						<StackedTransactionRow key={row.id} row={row} />
					))}
				</ul>
			</AccordionContent>
		</AccordionItem>
	);
}
