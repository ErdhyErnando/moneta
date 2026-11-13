import { LayerCard } from "@cloudflare/kumo";
import { DataTable, type Transaction } from "@/components/data-table";

type RecentTransactionsProps = {
	transactions: Transaction[];
	isLoading: boolean;
};

// Recent-transactions card for the dashboard (#49).
export function RecentTransactions({
	transactions,
	isLoading,
}: RecentTransactionsProps): React.JSX.Element {
	return (
		<LayerCard className="gap-4 rounded-xl p-6 shadow-none">
			<div className="font-semibold text-base">Recent Transactions</div>
			{isLoading ? (
				<div className="space-y-2">
					{[
						"skeleton-1",
						"skeleton-2",
						"skeleton-3",
						"skeleton-4",
						"skeleton-5",
					].map((key) => (
						<div
							key={key}
							className="h-12 w-full animate-pulse rounded-lg bg-kumo-fill"
						/>
					))}
				</div>
			) : (
				<DataTable data={transactions} />
			)}
		</LayerCard>
	);
}
