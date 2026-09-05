import { DataTable, type Transaction } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecentTransactionsProps = {
	transactions: Transaction[];
	isLoading: boolean;
};

// Recent-transactions card for the dashboard (#49).
export function RecentTransactions({
	transactions,
	isLoading,
}: RecentTransactionsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
			</CardHeader>
			<CardContent>
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
								className="h-12 w-full animate-pulse rounded bg-muted"
							/>
						))}
					</div>
				) : (
					<DataTable data={transactions} />
				)}
			</CardContent>
		</Card>
	);
}
