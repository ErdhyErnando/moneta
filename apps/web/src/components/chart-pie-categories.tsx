import { Select } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/index.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Pie, PieChart } from "recharts";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SignedAmount } from "@/components/dashboard/signed-amount";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import { categoryMark, useCategoryColorMode } from "@/lib/category-color";

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
		color: string;
	}>;
}

// Contract §10: a datum without a colour cycles `--chart-1..5` — nothing else exists.
const FALLBACK_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
];

export function ChartPieCategories({
	startDate,
	endDate,
}: ChartPieCategoriesProps) {
	const { formatCurrency } = useCurrency();
	const [categoryType, setCategoryType] = useState<"expense" | "income">(
		"expense",
	);
	const colorMode = useCategoryColorMode();
	const isExpense = categoryType === "expense";

	const { data, isLoading, isError, refetch } = useQuery({
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

	// Shared category palette (#19): the slice is the same mark the chip renders.
	const chartData: CategoryData[] =
		data?.categories.map((cat, index) => ({
			category: cat.name,
			amount: Number(cat.amount),
			percentage: cat.percentage,
			fill:
				categoryMark(cat.color, colorMode) ??
				FALLBACK_COLORS[index % FALLBACK_COLORS.length],
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

	return (
		<ChartCard
			title="Breakdown by category"
			height="lg"
			isLoading={isLoading}
			isError={isError}
			onRetry={() => {
				void refetch();
			}}
			isEmpty={chartData.length === 0}
			emptyTitle={
				isExpense ? "No expenses in this period" : "No income in this period"
			}
			emptyDescription="Change the period or log a transaction to see the split."
			bodyClassName="flex flex-col gap-2"
			actions={
				<Select
					className="w-36 max-md:h-11"
					aria-label="Category type"
					value={categoryType}
					onValueChange={(value) => {
						if (value) setCategoryType(value as "expense" | "income");
					}}
					items={[
						{ label: "Expense", value: "expense" },
						{ label: "Income", value: "income" },
					]}
				/>
			}
		>
			<div className="min-h-0 flex-1">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square h-full max-h-50 w-full"
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
							fill="var(--color-chart-1)"
							label={({ percentage }) => `${percentage.toFixed(1)}%`}
							outerRadius="85%"
							labelLine
						/>
					</PieChart>
				</ChartContainer>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-2 text-kumo-subtle text-sm">
				<span>{isExpense ? "Total expenses" : "Total income"}</span>
				<SignedAmount
					amount={total}
					formatCurrency={formatCurrency}
					direction={isExpense ? "negative" : "positive"}
					size="inline"
				/>
			</div>
		</ChartCard>
	);
}
