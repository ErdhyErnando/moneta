import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { useMemo } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartLegend } from "@/components/charts/chart-legend";
import { echarts, REPLACE_OPTION } from "@/components/charts/echarts";
import { useElementHeight } from "@/components/charts/use-element-height";
import { useCurrency } from "@/contexts/currency-context";
import {
	axisStyle,
	baseChartOption,
	formatCompactMoney,
	tooltipHtml,
	useChartTheme,
} from "@/lib/chart-theme";

interface ChartDatum {
	date: string;
	income: number;
	expense: number;
}

const EMPTY_CHART_DATA: ChartDatum[] = [];

interface ChartAreaInteractiveProps {
	data?: ChartDatum[];
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
}

const formatDay = (value: string) =>
	new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

const formatFullDay = (value: string) =>
	new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

/**
 * Dashboard cash flow: two areas (income vs expense), so it carries a legend —
 * the only chart here with two series (§10).
 */
export function ChartAreaInteractive({
	data = EMPTY_CHART_DATA,
	isLoading = false,
	isError = false,
	onRetry,
}: ChartAreaInteractiveProps): React.JSX.Element {
	const { formatCurrency, currency } = useCurrency();
	const theme = useChartTheme();
	const { ref, height } = useElementHeight<HTMLDivElement>();

	const totals = useMemo(
		() => ({
			income: data.reduce((sum, d) => sum + d.income, 0),
			expense: data.reduce((sum, d) => sum + d.expense, 0),
		}),
		[data],
	);

	const option = useMemo<KumoChartOption>(() => {
		const base = baseChartOption(theme);
		const axis = axisStyle(theme);
		const area = (color: string) => ({
			color,
			opacity: 0.18,
		});

		return {
			...base,
			grid: { left: 4, right: 12, top: 8, bottom: 4, containLabel: true },
			xAxis: {
				type: "category",
				boundaryGap: false,
				data: data.map((d) => d.date),
				...axis,
				splitLine: { show: false },
				axisLabel: {
					...axis.axisLabel,
					formatter: (value: string) => formatDay(value),
				},
			},
			yAxis: {
				type: "value",
				min: 0,
				...axis,
				axisLabel: {
					...axis.axisLabel,
					formatter: (value: number) =>
						formatCompactMoney(value, currency.symbol),
				},
			},
			series: [
				{
					name: "Expense",
					type: "line",
					smooth: 0.25,
					smoothMonotone: "x" as const,
					symbol: "none",
					lineStyle: { width: 2, color: theme.negative },
					itemStyle: { color: theme.negative },
					areaStyle: area(theme.negative),
					data: data.map((d) => d.expense),
				},
				{
					name: "Income",
					type: "line",
					smooth: 0.25,
					smoothMonotone: "x" as const,
					symbol: "none",
					lineStyle: { width: 2, color: theme.positive },
					itemStyle: { color: theme.positive },
					areaStyle: area(theme.positive),
					data: data.map((d) => d.income),
				},
			],
			tooltip: {
				...base.tooltip,
				trigger: "axis",
				axisPointer: { type: "line", lineStyle: { color: theme.grid } },
				dangerousHtmlFormatter: (params: unknown) => {
					const rows = (Array.isArray(params) ? params : [params]) as Array<{
						axisValue?: string;
						seriesName?: string;
						value?: number;
						color?: string;
					}>;
					const first = rows[0];
					return tooltipHtml(
						theme,
						first?.axisValue ? formatFullDay(first.axisValue) : undefined,
						rows.map((row) => ({
							label: row.seriesName ?? "",
							value: formatCurrency(Number(row.value ?? 0)),
							color: row.color,
						})),
					);
				},
			},
		} as unknown as KumoChartOption;
	}, [theme, data, currency.symbol, formatCurrency]);

	return (
		<ChartCard
			title="Cash Flow"
			description="Income vs expenses over time"
			height="base"
			bodyClassName="flex flex-col gap-3"
			isLoading={isLoading}
			isError={isError}
			onRetry={onRetry}
			isEmpty={data.length === 0}
			emptyTitle="No cash flow in this period"
			emptyDescription="Try a wider date range from the period filter."
		>
			<div ref={ref} className="min-h-0 flex-1">
				{height > 0 ? (
					<div
						role="img"
						aria-label={`Cash flow for the selected period. Income ${formatCurrency(totals.income)}, expenses ${formatCurrency(totals.expense)}.`}
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
				items={[
					{
						label: "Income",
						color: theme.positive,
						value: formatCurrency(totals.income),
					},
					{
						label: "Expense",
						color: theme.negative,
						value: formatCurrency(totals.expense),
					},
				]}
			/>
		</ChartCard>
	);
}
