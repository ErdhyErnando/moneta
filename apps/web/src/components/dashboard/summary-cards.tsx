import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconWallet,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardSummary {
	totalIncome: number;
	totalExpenses: number;
	netBalance: number;
	totalStartingBalance: number;
	currentBalance: number;
}

type SummaryCardsProps = {
	summary: DashboardSummary | undefined;
	isLoading: boolean;
	formatCurrency: (amount: number) => string;
};

// Summary cards row for the dashboard (#49).
export function SummaryCards({
	summary,
	isLoading,
	formatCurrency,
}: SummaryCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Total Income</CardTitle>
					<IconArrowUpRight className="size-4 text-emerald-500" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="h-8 w-32 animate-pulse rounded bg-muted" />
					) : (
						<div className="font-bold text-2xl text-emerald-600">
							+{formatCurrency(summary?.totalIncome || 0)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Total Expenses</CardTitle>
					<IconArrowDownRight className="size-4 text-rose-500" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="h-8 w-32 animate-pulse rounded bg-muted" />
					) : (
						<div className="font-bold text-2xl text-rose-600">
							-{formatCurrency(summary?.totalExpenses || 0)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Net Balance</CardTitle>
					<IconWallet className="size-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="h-8 w-32 animate-pulse rounded bg-muted" />
					) : (
						<div
							className={`font-bold text-2xl ${
								(summary?.netBalance || 0) >= 0
									? "text-emerald-600"
									: "text-rose-600"
							}`}
						>
							{formatCurrency(summary?.netBalance || 0)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Current Balance</CardTitle>
					<IconWallet className="size-4 text-blue-500" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="h-8 w-32 animate-pulse rounded bg-muted" />
					) : (
						<div
							className={`font-bold text-2xl ${
								(summary?.currentBalance || 0) >= 0
									? "text-blue-600"
									: "text-rose-600"
							}`}
						>
							{formatCurrency(summary?.currentBalance || 0)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
