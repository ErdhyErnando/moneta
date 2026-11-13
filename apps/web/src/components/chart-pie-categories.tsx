import { LayerCard, Select } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/index.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Pie, PieChart } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
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
		color: string;
	}>;
}

// Fallback palette if category has no color (should not happen, but keep for safety)
const FALLBACK_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
	"var(--color-kumo-subtle)",
];

function getCategoryFill(color: string | undefined, index: number): string {
	if (color && /^#[0-9a-fA-F]{6}$/.test(color)) return color;
	return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

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

	// Transform data for the chart — use shared category palette (color from DB per #19)
	const chartData: CategoryData[] =
		data?.categories.map((cat, index) => ({
			category: cat.name,
			amount: Number(cat.amount),
			percentage: cat.percentage,
			fill: getCategoryFill(cat.color, index),
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
		<LayerCard className="flex h-full flex-col gap-0 rounded-xl p-0 shadow-none">
			<div className="flex flex-col items-center px-6 pt-6 pb-0">
				<Select
					className="w-[180px]"
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
				<div className="text-kumo-subtle text-sm">Breakdown by category</div>
			</div>
			<div className="flex-1 px-6 pb-0">
				{isLoading ? (
					<div className="h-[280px] animate-pulse rounded-lg bg-kumo-fill" />
				) : chartData.length === 0 ? (
					<div className="flex h-[280px] items-center justify-center text-kumo-subtle">
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
									fill="var(--color-chart-1)"
									label={({ percentage }) => `${percentage.toFixed(1)}%`}
									outerRadius="85%"
									labelLine
								/>
							</PieChart>
						</ChartContainer>
						<div className="mt-4 text-center">
							<p className="text-kumo-subtle text-sm tabular-nums">
								{totalLabel}: {formatCurrency(total)}
							</p>
						</div>
					</>
				)}
			</div>
		</LayerCard>
	);
}
