import { Select } from "@cloudflare/kumo";
import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartLegend } from "@/components/charts/chart-legend";
import { echarts, REPLACE_OPTION } from "@/components/charts/echarts";
import { useElementHeight } from "@/components/charts/use-element-height";
import { SignedAmount } from "@/components/money/signed-amount";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import { categoryMark, useCategoryColorMode } from "@/lib/category-color";
import {
	baseChartOption,
	toChartColor,
	tooltipHtml,
	useChartTheme,
} from "@/lib/chart-theme";

interface ChartPieCategoriesProps {
	startDate?: string;
	endDate?: string;
}

interface CategoryDatum {
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

/**
 * Dashboard breakdown, per datum coloured from `categories.color` (#19).
 *
 * No inline labels at all: with a single slice the old chart drew a "100.0%"
 * leader into the void, and with many small slices the leaders overlapped. The
 * legend below carries every category's name and share instead, which is also
 * the only version screen readers can read (§2.7 rule 1).
 */
export function ChartPieCategories({
	startDate,
	endDate,
}: ChartPieCategoriesProps): React.JSX.Element {
	const { formatCurrency } = useCurrency();
	const [categoryType, setCategoryType] = useState<"expense" | "income">(
		"expense",
	);
	const colorMode = useCategoryColorMode();
	const isExpense = categoryType === "expense";
	const theme = useChartTheme();
	const { ref, height } = useElementHeight<HTMLDivElement>();

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
	const chartData: CategoryDatum[] = useMemo(() => {
		const rows = data?.categories ?? [];
		return rows.map((cat, index) => {
			// `categoryMark` returns an `oklch()` string — fine for CSS, but ECharts
			// draws on a canvas and needs a concrete color.
			const mark = categoryMark(cat.color, colorMode);
			return {
				category: cat.name,
				amount: Number(cat.amount),
				percentage: cat.percentage,
				fill: mark
					? toChartColor(mark)
					: (theme.palette[index % theme.palette.length] as string),
			};
		});
	}, [data, colorMode, theme.palette]);

	const total = chartData.reduce((sum, item) => sum + item.amount, 0);

	const option = useMemo<KumoChartOption>(() => {
		const base = baseChartOption(theme);

		return {
			...base,
			tooltip: {
				...base.tooltip,
				trigger: "item",
				dangerousHtmlFormatter: (params: unknown) => {
					const row = params as {
						name?: string;
						value?: number;
						percent?: number;
						color?: string;
					};
					return tooltipHtml(theme, row.name, [
						{
							label: `${Number(row.percent ?? 0).toFixed(1)}%`,
							value: formatCurrency(Number(row.value ?? 0)),
							color: row.color,
						},
					]);
				},
			},
			series: [
				{
					name: isExpense ? "Expense" : "Income",
					type: "pie",
					radius: "76%",
					center: ["50%", "50%"],
					itemStyle: { borderColor: theme.surface, borderWidth: 1 },
					label: { show: false },
					labelLine: { show: false },
					avoidLabelOverlap: true,
					emphasis: { scale: true, scaleSize: 4 },
					data: chartData.map((item) => ({
						name: item.category,
						value: item.amount,
						itemStyle: { color: item.fill },
					})),
				},
			],
		} as unknown as KumoChartOption;
	}, [theme, chartData, isExpense, formatCurrency]);

	return (
		<ChartCard
			title="Breakdown by category"
			height="lg"
			bodyClassName="flex flex-col gap-3"
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
			<div ref={ref} className="min-h-0 flex-1">
				{height > 0 ? (
					<div
						role="img"
						aria-label={`${isExpense ? "Expenses" : "Income"} by category for the selected period, ${chartData.length} categories, total ${formatCurrency(total)}.`}
					>
						<Chart
							echarts={echarts}
							options={option}
							height={height}
							optionUpdateBehavior={REPLACE_OPTION}
						/>
					</div>
				) : null}
			</div>
			<ChartLegend
				className="justify-start"
				items={chartData.map((item) => ({
					label: item.category,
					color: item.fill,
					value: `${item.percentage.toFixed(1)}%`,
				}))}
			/>
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
