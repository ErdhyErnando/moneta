"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

interface ChartPieCategoriesProps {
	startDate?: string;
	endDate?: string;
}

interface CategoryData {
	category: string;
	amount: number;
	percentage: number;
	fill: string;
}

interface CategoriesResponse {
	categories: Array<{
		name: string;
		amount: string;
		percentage: number;
	}>;
}

const EXPENSE_CHART_COLORS = [
	"var(--destructive)",
	"var(--chart-2)",
	"var(--sidebar-foreground)",
	"var(--sidebar)",
	"var(--sidebar-primary)",
	"var(--chart-6)",
	"var(--foreground)",
	"var(--chart-8)",
];

const INCOME_CHART_COLORS = [
	"var(--chart-2)",
	"var(--sidebar-primary)",
	"var(--chart-6)",
	"var(--sidebar-foreground)",
	"var(--sidebar)",
	"var(--foreground)",
	"var(--chart-8)",
	"var(--destructive)",
];

export function ChartPieCategories({
	startDate,
	endDate,
}: ChartPieCategoriesProps) {
	const { formatCurrency } = useCurrency();
	const [categoryType, setCategoryType] = useState<"expense" | "income">(
		"expense",
	);

	const { data, isLoading } = useQuery({
		queryKey: [
			categoryType === "expense" ? "expense-categories" : "income-categories",
			startDate,
			endDate,
		],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (startDate) params.append("startDate", startDate);
			if (endDate) params.append("endDate", endDate);

			const endpoint =
				categoryType === "expense"
					? "/api/dashboard/expense-categories"
					: "/api/dashboard/income-categories";

			const response = await api.get<CategoriesResponse>(
				`${endpoint}?${params.toString()}`,
			);
			return response.data;
		},
	});

	const chartColors =
		categoryType === "expense" ? EXPENSE_CHART_COLORS : INCOME_CHART_COLORS;

	// Transform data for the chart
	const chartData: CategoryData[] =
		data?.categories.map((cat, index) => ({
			category: cat.name,
			amount: Number(cat.amount),
			percentage: cat.percentage,
			fill: chartColors[index % chartColors.length],
		})) || [];

	// Build chart config dynamically
	const chartConfig: ChartConfig = chartData.reduce(
		(config, item) => {
			config[item.category] = {
				label: item.category,
				color: item.fill,
			};
			return config;
		},
		{
			amount: {
				label: "Amount",
			},
		} as ChartConfig,
	);

	const total = chartData.reduce((sum, item) => sum + item.amount, 0);
	const emptyMessage =
		categoryType === "expense"
			? "No expense data available"
			: "No income data available";
	const totalLabel =
		categoryType === "expense" ? "Total Expenses" : "Total Income";

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<Select
					value={categoryType}
					onValueChange={(value) =>
						setCategoryType(value as "expense" | "income")
					}
				>
					<SelectTrigger className="w-[180px] border-none font-semibold text-lg shadow-none focus:ring-0">
						<SelectValue placeholder="Select category type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="expense">Expense</SelectItem>
						<SelectItem value="income">Income</SelectItem>
					</SelectContent>
				</Select>
				<CardDescription>Breakdown by category</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				{isLoading ? (
					<div className="flex h-[280px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : chartData.length === 0 ? (
					<div className="flex h-[280px] items-center justify-center text-muted-foreground">
						{emptyMessage}
					</div>
				) : (
					<>
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-h-[280px] w-full"
						>
							<PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
								<ChartTooltip
									content={
										<ChartTooltipContent
											hideLabel
											formatter={(value, name) => (
												<div className="flex items-center gap-2">
													<span className="font-medium">{name}:</span>
													<span className="font-bold">
														{formatCurrency(Number(value))}
													</span>
												</div>
											)}
										/>
									}
								/>
								<Pie
									data={chartData}
									dataKey="amount"
									nameKey="category"
									fill="#8884d8"
									label={({ percentage }) => `${percentage.toFixed(1)}%`}
									outerRadius="85%"
									labelLine
								/>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 text-center">
							<p className="text-muted-foreground text-sm">
								{totalLabel}: {formatCurrency(total)}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
