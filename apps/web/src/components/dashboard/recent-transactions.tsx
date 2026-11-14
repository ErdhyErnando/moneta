import { Banner, LayerCard } from "@cloudflare/kumo";
import {
	ArrowClockwiseIcon,
	ReceiptIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { CategoryBadge } from "@/components/category-badge";
import { SignedAmount } from "@/components/dashboard/signed-amount";
import type { Transaction } from "@/components/data-table";
import { EmptyState } from "@/components/layout";
import { useCurrency } from "@/contexts/currency-context";
import { asUtcDay } from "@/lib/date";

type RecentTransactionsProps = {
	transactions: Transaction[];
	isLoading: boolean;
	isError?: boolean;
	onRetry?: () => void;
};

const ROW_SKELETONS = [
	"skeleton-1",
	"skeleton-2",
	"skeleton-3",
	"skeleton-4",
	"skeleton-5",
];

/**
 * The dashboard's last ten transactions.
 *
 * Read-only by design: the dashboard is a summary view, so this card shows the
 * data and nothing else — the single primary CTA and the period filter live in
 * the page header (docs/design.md §7.1, "data over chrome"). Rows stack on
 * mobile instead of scrolling horizontally.
 */
export function RecentTransactions({
	transactions,
	isLoading,
	isError = false,
	onRetry,
}: RecentTransactionsProps): React.JSX.Element {
	const { formatCurrency } = useCurrency();

	return (
		<LayerCard className="flex flex-col gap-0 rounded-xl p-0 shadow-none">
			<div className="border-kumo-hairline border-b px-6 py-4">
				<h3 className="font-semibold text-base text-kumo-strong">
					Recent Transactions
				</h3>
			</div>

			<div className="px-6 py-2">
				{isLoading ? (
					<div className="divide-y divide-kumo-hairline">
						{ROW_SKELETONS.map((key) => (
							<div key={key} className="py-2">
								<div className="h-10 w-full animate-pulse rounded-lg bg-kumo-fill" />
							</div>
						))}
					</div>
				) : isError ? (
					<Banner
						variant="error"
						icon={<WarningCircleIcon size={16} />}
						title="Could not load recent transactions"
						description="The transaction list did not load."
						action={
							onRetry ? (
								<Banner.Action
									variant="secondary"
									icon={<ArrowClockwiseIcon size={16} />}
									onClick={onRetry}
								>
									Retry
								</Banner.Action>
							) : undefined
						}
					/>
				) : transactions.length === 0 ? (
					<EmptyState
						icon={<ReceiptIcon size={20} />}
						title="No transactions yet"
						description="Nothing was recorded in this period. Try a wider range, or add a transaction."
					/>
				) : (
					<ul className="divide-y divide-kumo-hairline">
						{transactions.map((transaction) => {
							const isIncome = transaction.type === "income";
							const date = asUtcDay(transaction.date);

							return (
								<li
									/* income and expense ids come from different tables (#22), so
									   the type is part of the identity. */
									key={`${transaction.type}-${transaction.id}`}
									className="flex items-center gap-3 py-2"
								>
									<div className="min-w-0 flex-1 space-y-1">
										<p className="truncate font-medium text-kumo-default">
											{transaction.description}
										</p>
										<div className="flex flex-wrap items-center gap-2 md:hidden">
											<span className="text-kumo-subtle text-sm">
												{date.toLocaleDateString()}
											</span>
											<CategoryBadge
												name={transaction.category}
												color={transaction.categoryColor}
											/>
										</div>
									</div>

									<div className="hidden w-40 shrink-0 md:block">
										<CategoryBadge
											name={transaction.category}
											color={transaction.categoryColor}
										/>
									</div>

									<div className="hidden w-28 shrink-0 text-kumo-subtle text-sm md:block">
										{date.toLocaleDateString()}
									</div>

									<div className="flex w-28 shrink-0 justify-end">
										<SignedAmount
											amount={transaction.amount}
											formatCurrency={formatCurrency}
											direction={isIncome ? "positive" : "negative"}
											size="inline"
										/>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</LayerCard>
	);
}
