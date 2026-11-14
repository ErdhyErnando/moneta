// ECharts ships in an async chunk: this module loads only via React.lazy in
// routes/_authenticated/{expense,income}_.breakdown.tsx, never in the initial
// bundle (#48).
import { Tabs } from "@cloudflare/kumo";
import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { useMemo } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { echarts, REPLACE_OPTION } from "@/components/charts/echarts";
import { SignedAmount } from "@/components/money/signed-amount";
import { useCurrency } from "@/contexts/currency-context";
import {
	axisStyle,
	baseChartOption,
	tooltipHtml,
	useChartTheme,
} from "@/lib/chart-theme";
import { BreakdownPeriodNav } from "./breakdown-period-nav";
import { useCategoryBreakdownData } from "./use-category-breakdown-data";

interface Props {
	type: "income" | "expense";
}

export function CategoryBreakdownChart({ type }: Props): React.JSX.Element {
	const { formatCurrency } = useCurrency();
	const {
		period,
		setPeriod,
		setCurrentDate,
		start,
		end,
		isLoading,
		isError,
		refetch,
		chartData,
		total,
		navigatePeriod,
		currentYear,
		currentMonth,
		handleYearChange,
		handleMonthChange,
	} = useCategoryBreakdownData(type);

	// Bar height: one row per category, so the card can size itself (height="auto").
	const chartHeight = Math.max(300, chartData.length * 56);
	const theme = useChartTheme();

	const option = useMemo<KumoChartOption>(() => {
		const base = baseChartOption(theme);
		const axis = axisStyle(theme);
		const values = chartData.map((item) => item.amount);
		const maxAmount = Math.max(...values, 0);

		return {
			...base,
			grid: { left: 4, right: 8, top: 4, bottom: 4, containLabel: true },
			xAxis: {
				type: "value",
				// Decorations off, axis still rendered: ECharts skips series-label
				// layout on a hidden axis and parks every label at the origin.
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				max: maxAmount > 0 ? Math.ceil(maxAmount * 1.5) : 1,
			},
			yAxis: {
				type: "category",
				// Newest/largest at the top: reverse the categories rather than
				// `inverse: true`, which lands the series labels on the wrong row.
				data: [...chartData].reverse().map((item) => item.name),
				...axis,
				splitLine: { show: false },
			},
			series: [
				{
					name: type === "income" ? "Income" : "Expense",
					type: "bar",
					// Capped thickness: a single category used to render one
					// full-height slab with its label clipped outside the grid.
					barMaxWidth: 22,
					data: [...chartData].reverse().map((item) => ({
						value: item.amount,
						itemStyle: { color: item.fill, borderRadius: 4 },
					})),
					label: {
						show: true,
						position: "right",
						color: theme.text,
						fontSize: theme.fontSize,
						padding: [0, 0, 0, 6],
						// Exact value on the bar; only the axes are compact.
						formatter: ({ value }: { value: number }) => formatCurrency(value),
					},
				},
			],
			tooltip: {
				...base.tooltip,
				trigger: "item",
				dangerousHtmlFormatter: (params: unknown) => {
					const row = params as { name?: string; value?: number };
					return tooltipHtml(theme, row.name, [
						{
							label: type === "income" ? "Income" : "Expense",
							value: formatCurrency(Number(row.value ?? 0)),
						},
					]);
				},
			},
		} as unknown as KumoChartOption;
	}, [theme, chartData, type, formatCurrency]);

	return (
		<ChartCard
			title="By category"
			description="Where the money went, per category."
			height="auto"
			actions={
				<Tabs
					size="sm"
					tabs={[
						{ value: "weekly", label: "Weekly" },
						{ value: "monthly", label: "Monthly" },
						{ value: "yearly", label: "Yearly" },
					]}
					value={period}
					onValueChange={(v) => {
						setPeriod(v as never);
						setCurrentDate(new Date());
					}}
				/>
			}
			toolbar={
				<BreakdownPeriodNav
					period={period}
					currentMonth={currentMonth}
					currentYear={currentYear}
					start={start}
					end={end}
					onNavigate={navigatePeriod}
					onMonthChange={handleMonthChange}
					onYearChange={handleYearChange}
				/>
			}
			isLoading={isLoading}
			isError={isError}
			onRetry={() => {
				void refetch();
			}}
			isEmpty={chartData.length === 0}
			emptyTitle={`No ${type} in this period`}
			emptyDescription="Pick another month or year to compare."
			bodyClassName="space-y-4"
		>
			<div
				role="img"
				aria-label={`${type === "income" ? "Income" : "Expenses"} by category: ${chartData
					.map((item) => `${item.name} ${formatCurrency(item.amount)}`)
					.join(", ")}. Total ${formatCurrency(total)}.`}
			>
				<Chart
					echarts={echarts}
					options={option}
					height={chartHeight}
					optionUpdateBehavior={REPLACE_OPTION}
				/>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2 border-kumo-hairline border-t pt-4 text-kumo-subtle text-sm">
				<span>Total {type === "income" ? "income" : "expenses"}</span>
				<SignedAmount
					amount={total}
					formatCurrency={formatCurrency}
					direction={type === "income" ? "positive" : "negative"}
					size="inline"
				/>
			</div>
		</ChartCard>
	);
}
