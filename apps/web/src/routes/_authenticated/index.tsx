import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";

const ChartAreaInteractive = lazy(() =>
	import("@/components/chart-area-interactive").then((m) => ({
		default: m.ChartAreaInteractive,
	})),
);
const ChartBarMonthlyExpenses = lazy(() =>
	import("@/components/chart-bar-monthly-expenses").then((m) => ({
		default: m.ChartBarMonthlyExpenses,
	})),
);
const ChartBarMonthlyIncome = lazy(() =>
	import("@/components/chart-bar-monthly-income").then((m) => ({
		default: m.ChartBarMonthlyIncome,
	})),
);
const ChartPieCategories = lazy(() =>
	import("@/components/chart-pie-categories").then((m) => ({
		default: m.ChartPieCategories,
	})),
);

import {
	DashboardHeader,
	type TimeRange,
} from "@/components/dashboard/dashboard-header";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import {
	type DashboardSummary,
	SummaryCards,
} from "@/components/dashboard/summary-cards";
import type { Transaction } from "@/components/data-table";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import { utcDayString } from "@/lib/date";

export const Route = createFileRoute("/_authenticated/")({
	component: HomeComponent,
});

// API functions
async function fetchDashboardSummary(
	startDate?: string,
	endDate?: string,
): Promise<DashboardSummary> {
	const params = new URLSearchParams();
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);

	const response = await api.get<{ summary: DashboardSummary }>(
		`/api/dashboard/summary?${params.toString()}`,
	);
	return response.data.summary;
}

async function fetchRecentTransactions(
	limit = 10,
	startDate?: string,
	endDate?: string,
): Promise<Transaction[]> {
	const params = new URLSearchParams();
	params.append("limit", limit.toString());
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);

	const response = await api.get<{ transactions: Transaction[] }>(
		`/api/dashboard/transactions?${params.toString()}`,
	);
	return response.data.transactions;
}

function HomeComponent() {
	const { formatCurrency } = useCurrency();
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");
	const [monthlyChartType, setMonthlyChartType] = useState<
		"expense" | "income"
	>("expense");

	const [customStartDate, setCustomStartDate] = useState<Date>();
	const [customEndDate, setCustomEndDate] = useState<Date>();

	// Memoize date range calculation to prevent infinite refetch loops
	const { startDate, endDate } = useMemo(() => {
		const now = new Date();
		let startDate: Date | undefined;
		let endDate: Date | undefined = now;

		if (timeRange === "custom") {
			startDate = customStartDate;
			endDate = customEndDate;
		} else {
			const days = Number.parseInt(timeRange.replace("d", ""), 10);
			startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
		}

		return {
			// date-only strings → server normalizes to UTC day boundaries (#22)
			startDate: startDate ? utcDayString(startDate) : undefined,
			endDate: endDate ? utcDayString(endDate) : undefined,
		};
	}, [timeRange, customStartDate, customEndDate]);

	// Fetch dashboard summary
	const { data: summary, isLoading: summaryLoading } = useQuery({
		queryKey: ["dashboard-summary", startDate, endDate],
		queryFn: () => fetchDashboardSummary(startDate, endDate),
	});

	// Fetch recent transactions
	const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
		queryKey: ["dashboard-transactions", startDate, endDate],
		queryFn: () => fetchRecentTransactions(10, startDate, endDate),
	});

	// Fetch chart data
	const { data: chartDataResponse, isLoading: chartLoading } = useQuery({
		queryKey: ["dashboard-chart", startDate, endDate],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);

			const response = await api.get<{
				chartData: Array<{ date: string; income: number; expense: number }>;
			}>(`/api/dashboard/chart?${params.toString()}`);
			return response.data.chartData;
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<DashboardHeader
				timeRange={timeRange}
				onTimeRangeChange={setTimeRange}
				customStartDate={customStartDate}
				customEndDate={customEndDate}
				onCustomStartChange={setCustomStartDate}
				onCustomEndChange={setCustomEndDate}
			/>

			<SummaryCards
				summary={summary}
				isLoading={summaryLoading}
				formatCurrency={formatCurrency}
			/>

			{/* Chart and Category Pie */}
			<div className="grid gap-6 md:grid-cols-7">
				<div className="md:col-span-4">
					<Suspense
						fallback={
							<div className="h-[280px] animate-pulse rounded bg-muted" />
						}
					>
						<ChartAreaInteractive
							data={chartDataResponse}
							isLoading={chartLoading}
						/>
					</Suspense>
				</div>
				<div className="md:col-span-3">
					<Suspense
						fallback={
							<div className="h-[280px] animate-pulse rounded bg-muted" />
						}
					>
						<ChartPieCategories startDate={startDate} endDate={endDate} />
					</Suspense>
				</div>
			</div>

			{/* Monthly Bar Chart — lazy per #25 */}
			<Suspense
				fallback={<div className="h-[300px] animate-pulse rounded bg-muted" />}
			>
				{monthlyChartType === "expense" ? (
					<ChartBarMonthlyExpenses
						onToggle={() => setMonthlyChartType("income")}
					/>
				) : (
					<ChartBarMonthlyIncome
						onToggle={() => setMonthlyChartType("expense")}
					/>
				)}
			</Suspense>

			<RecentTransactions
				transactions={transactions}
				isLoading={transactionsLoading}
			/>
		</div>
	);
}
