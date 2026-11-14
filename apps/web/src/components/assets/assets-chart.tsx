import { Select } from "@cloudflare/kumo";
import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { echarts, REPLACE_OPTION } from "@/components/charts/echarts";
import { useElementHeight } from "@/components/charts/use-element-height";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import {
	axisStyle,
	baseChartOption,
	formatCompactMoney,
	tooltipHtml,
	useChartTheme,
} from "@/lib/chart-theme";

const MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/**
 * Asset value by month. Card chrome comes from the shared `ChartCard`
 * (§7.2/§7.8/#10); the plot is ECharts through kumo's `Chart`.
 */
export function AssetsChart(): React.JSX.Element {
	const { formatCurrency, currency } = useCurrency();
	const theme = useChartTheme();
	const { ref, height } = useElementHeight<HTMLDivElement>();
	// Use UTC year to match server DATE_TRUNC UTC per #22
	const currentYear = new Date().getUTCFullYear();
	const [selectedYear, setSelectedYear] = useState(() =>
		currentYear.toString(),
	);

	const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["assets-monthly", selectedYear],
		queryFn: async () => {
			const response = await api.get<{
				monthlyData: Array<{ month: string; amount: string }>;
			}>(`/api/assets/monthly?year=${selectedYear}`);
			return response.data;
		},
	});

	const chartData = MONTH_NAMES.map((month, index) => {
		const monthData = data?.monthlyData.find((d) => {
			const monthIndex = Number.parseInt(d.month.split("-")[1], 10) - 1;
			return monthIndex === index;
		});

		return {
			month,
			amount: monthData ? Number(monthData.amount) : 0,
		};
	});

	const totalAssets = chartData.reduce((sum, item) => sum + item.amount, 0);

	// Assembled from the shared theme helpers, so the option is validated by
	// ECharts at runtime and typed once at this boundary instead of field by field.
	const option = useMemo<KumoChartOption>(() => {
		const base = baseChartOption(theme);
		const axis = axisStyle(theme);

		return {
			...base,
			grid: { left: 4, right: 12, top: 8, bottom: 4, containLabel: true },
			xAxis: {
				type: "category" as const,
				boundaryGap: false,
				data: chartData.map((d) => d.month),
				...axis,
				splitLine: { show: false },
				// Deliberate density, not silent auto-hiding: every other month is
				// labelled at every width, so a 375px screen never drops a label
				// without telling the reader.
				axisLabel: { ...axis.axisLabel, interval: 1 },
			},
			yAxis: {
				type: "value" as const,
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
					name: "Assets",
					type: "line" as const,
					// Monotone between points: the old natural spline dipped below
					// zero between two zero months.
					smooth: true,
					smoothMonotone: "x" as const,
					symbol: "none",
					lineStyle: { width: 2, color: theme.palette[0] },
					itemStyle: { color: theme.palette[0] },
					areaStyle: { color: theme.palette[0], opacity: 0.18 },
					data: chartData.map((d) => d.amount),
				},
			],
			tooltip: {
				...base.tooltip,
				trigger: "axis" as const,
				axisPointer: {
					type: "line" as const,
					lineStyle: { color: theme.grid },
				},
				dangerousHtmlFormatter: (params: unknown) => {
					const rows = Array.isArray(params) ? params : [params];
					const first = rows[0] as { axisValue?: string; value?: number };
					return tooltipHtml(theme, first?.axisValue, [
						{
							label: "Assets",
							value: formatCurrency(Number(first?.value ?? 0)),
						},
					]);
				},
			},
		} as unknown as KumoChartOption;
	}, [theme, chartData, currency.symbol, formatCurrency]);

	return (
		<ChartCard
			title="Asset value"
			description={`Total holdings by month for ${selectedYear}`}
			height="base"
			bodyClassName="flex flex-col gap-4"
			actions={
				<Select
					size="sm"
					className="w-32 max-md:h-11"
					aria-label="Year"
					placeholder="Select year"
					value={selectedYear}
					onValueChange={(value) => {
						if (value) setSelectedYear(value);
					}}
					items={yearOptions.map((year) => ({
						label: String(year),
						value: year.toString(),
					}))}
				/>
			}
			isLoading={isLoading}
			isError={isError}
			onRetry={() => refetch()}
			isEmpty={!isLoading && !isError && totalAssets === 0}
			emptyTitle="No holdings this year"
			emptyDescription="Add an asset and its value will show up here."
		>
			<div ref={ref} data-chart-h={height} className="min-h-0 flex-1">
				{height > 0 ? (
					<div
						role="img"
						aria-label={`Asset value by month in ${selectedYear}. Total ${formatCurrency(totalAssets)}.`}
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
			<p className="text-center text-kumo-subtle text-sm tabular-nums">
				Total for {selectedYear}: {formatCurrency(totalAssets)}
			</p>
		</ChartCard>
	);
}
