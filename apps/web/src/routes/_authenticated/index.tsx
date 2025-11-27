import {
	IconArrowDownRight,
	IconArrowUpRight,
	IconCalendar,
	IconWallet,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { CurrencySelector } from "@/components/currency-selector";
import { DataTable, type Transaction } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/")({
	component: HomeComponent,
});

type TimeRange = "7d" | "30d" | "90d" | "custom";

interface DashboardSummary {
	totalIncome: number;
	totalExpenses: number;
	netBalance: number;
}

// API functions
async function fetchDashboardSummary(
	startDate?: string,
	endDate?: string,
): Promise<DashboardSummary> {
	const params = new URLSearchParams();
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);

	const response = await api.get(`/api/dashboard/summary?${params.toString()}`);
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

	const response = await api.get(
		`/api/dashboard/transactions?${params.toString()}`,
	);
	return response.data.transactions;
}

function HomeComponent() {
	const { formatCurrency } = useCurrency();
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");
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
			startDate: startDate?.toISOString(),
			endDate: endDate?.toISOString(),
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

			const response = await api.get(
				`/api/dashboard/chart?${params.toString()}`,
			);
			return response.data.chartData;
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* Time Range Selector */}
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-3xl">Dashboard</h1>
				<div className="flex items-center gap-2">
					<CurrencySelector />
					<Select
						value={timeRange}
						onValueChange={(value) => setTimeRange(value as TimeRange)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select time range" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7d">Last 7 days</SelectItem>
							<SelectItem value="30d">Last 30 days</SelectItem>
							<SelectItem value="90d">Last 90 days</SelectItem>
							<SelectItem value="custom">Custom range</SelectItem>
						</SelectContent>
					</Select>

					{timeRange === "custom" && (
						<>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-[140px] justify-start">
										<IconCalendar className="mr-2 size-4" />
										{customStartDate
											? format(customStartDate, "MMM dd, yyyy")
											: "Start date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={customStartDate}
										onSelect={setCustomStartDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>

							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-[140px] justify-start">
										<IconCalendar className="mr-2 size-4" />
										{customEndDate
											? format(customEndDate, "MMM dd, yyyy")
											: "End date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={customEndDate}
										onSelect={setCustomEndDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</>
					)}
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Income</CardTitle>
						<IconArrowUpRight className="size-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						{summaryLoading ? (
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
						<CardTitle className="font-medium text-sm">
							Total Expenses
						</CardTitle>
						<IconArrowDownRight className="size-4 text-rose-500" />
					</CardHeader>
					<CardContent>
						{summaryLoading ? (
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
						{summaryLoading ? (
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
			</div>

			{/* Chart and Transactions */}
			<div className="grid gap-6 md:grid-cols-7">
				<div className="md:col-span-4">
					<ChartAreaInteractive
						data={chartDataResponse}
						isLoading={chartLoading}
					/>
				</div>
				<div className="md:col-span-3">
					<Card className="h-full">
						<CardHeader>
							<CardTitle>Recent Transactions</CardTitle>
						</CardHeader>
						<CardContent>
							{transactionsLoading ? (
								<div className="space-y-2">
									{[...Array(5)].map((_, i) => (
										<div
											key={`skeleton-${i}`}
											className="h-12 w-full animate-pulse rounded bg-muted"
										/>
									))}
								</div>
							) : (
								<DataTable data={transactions} />
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
