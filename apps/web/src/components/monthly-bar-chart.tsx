import { Button, Select } from "@cloudflare/kumo";
import { Chart, type KumoChartOption } from "@cloudflare/kumo/components/chart";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { echarts, REPLACE_OPTION } from "@/components/charts/echarts";
import { useElementHeight } from "@/components/charts/use-element-height";
import { SignedAmount } from "@/components/money/signed-amount";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import {
	axisStyle,
	baseChartOption,
	tooltipHtml,
	useChartTheme,
} from "@/lib/chart-theme";

interface MonthlyDatum {
	month: string;
	amount: number;
}

interface MonthlyBarResponse {
	monthlyData: Array<{
		month: string;
		amount: string;
	}>;
}

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

export type MonthlyBarChartProps = {
	title: string;
	descriptionPrefix: string;
	queryKeyBase: string;
	endpoint: (year: string) => string;
	barLabel: string;
	/** Which P&L token the bars and the total carry (§2.4, §2.5). */
	direction: "positive" | "negative";
	toggleTitle: string;
	onToggle?: () => void;
};

/**
 * Twelve months on a horizontal category axis.
 *
 * The month names live on the **axis**, not inside the bars: the old version
 * drew them inside the bar with `fill-background`, which is invisible on an
 * empty (zero-length) bar in light mode. Bars are capped (`barMaxWidth`) so a
 * single month is a normal-width bar instead of one full-height slab, and the
 * value label sits in the grid's headroom instead of being clipped at the edge.
 */
export function MonthlyBarChart({
	title,
	descriptionPrefix,
	queryKeyBase,
	endpoint,
	barLabel,
	direction,
	toggleTitle,
	onToggle,
}: MonthlyBarChartProps): React.JSX.Element {
	const { formatCurrency } = useCurrency();
	const theme = useChartTheme();
	const { ref, height } = useElementHeight<HTMLDivElement>();
	// Use UTC year to match server DATE_TRUNC UTC per #22
	const currentYear = new Date().getUTCFullYear();
	const [selectedYear, setSelectedYear] = useState(() =>
		currentYear.toString(),
	);

	// Generate year options (current year + 4 previous years)
	const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: [queryKeyBase, selectedYear],
		queryFn: async () => {
			const response = await api.get<MonthlyBarResponse>(
				endpoint(selectedYear),
			);
			return response.data;
		},
	});

	// Transform data for the chart - ensure all 12 months are present
	// Parse month directly from string (format: "YYYY-MM-01") to avoid timezone issues.
	// Memoized on the query result: a fresh array on every render would rebuild the
	// ECharts option and re-`setOption` continuously.
	const chartData: MonthlyDatum[] = useMemo(
		() =>
			MONTH_NAMES.map((month, index) => {
				const monthData = data?.monthlyData.find((d) => {
					// Extract month from "YYYY-MM-01" (MM is 1-indexed, so subtract 1)
					const monthIndex = Number.parseInt(d.month.split("-")[1], 10) - 1;
					return monthIndex === index;
				});

				return {
					month,
					amount: monthData ? Number(monthData.amount) : 0,
				};
			}),
		[data],
	);

	const total = chartData.reduce((sum, item) => sum + item.amount, 0);
	const hasData = (data?.monthlyData.length ?? 0) > 0;
	const barColor = direction === "positive" ? theme.positive : theme.negative;
	const maxAmount = Math.max(...chartData.map((d) => d.amount), 0);

	const option = useMemo<KumoChartOption>(() => {
		const base = baseChartOption(theme);
		const axis = axisStyle(theme);

		return {
			...base,
			grid: { left: 4, right: 8, top: 4, bottom: 4, containLabel: true },
			xAxis: {
				type: "value",
				// Rendered but undecorated: ECharts skips series-label layout when the
				// axis itself is `show: false`.
				axisLabel: { show: false },
				axisLine: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				// Headroom so the value label at the end of the longest bar is
				// inside the canvas instead of clipped by the card edge.
				max: maxAmount > 0 ? Math.ceil(maxAmount * 1.5) : 1,
			},
			yAxis: {
				type: "category",
				// Newest month at the top: reverse the categories rather than
				// `inverse: true`, which puts ECharts' series labels on the wrong row.
				data: [...chartData].reverse().map((d) => d.month),
				...axis,
				splitLine: { show: false },
			},
			series: [
				{
					name: barLabel,
					type: "bar",
					barMaxWidth: 18,
					itemStyle: { color: barColor, borderRadius: 3 },
					data: [...chartData].reverse().map((d) => d.amount),
					label: {
						show: true,
						position: "right",
						color: theme.text,
						fontSize: theme.fontSize,
						// `offset` breaks label layout on ECharts 6 bar series (labels
						// collapse to the origin); padding does the same job safely.
						padding: [0, 0, 0, 6],
						// Exact value on the bar; only the axes are compact.
						formatter: ({ value }: { value: number }) =>
							value > 0 ? formatCurrency(value) : "",
					},
				},
			],
			tooltip: {
				...base.tooltip,
				trigger: "item",
				dangerousHtmlFormatter: (params: unknown) => {
					const row = params as { name?: string; value?: number };
					return tooltipHtml(theme, row.name, [
						{ label: barLabel, value: formatCurrency(Number(row.value ?? 0)) },
					]);
				},
			},
		} as unknown as KumoChartOption;
	}, [theme, chartData, barLabel, barColor, maxAmount, formatCurrency]);

	return (
		<ChartCard
			title={title}
			description={`${descriptionPrefix} for ${selectedYear}`}
			height="xl"
			isLoading={isLoading}
			isError={isError}
			onRetry={() => {
				void refetch();
			}}
			isEmpty={!hasData}
			emptyTitle={`No ${barLabel.toLowerCase()} recorded in ${selectedYear}`}
			emptyDescription="Pick another year to compare."
			bodyClassName="flex flex-col gap-2"
			actions={
				<>
					{onToggle && (
						<Button
							variant="ghost"
							shape="square"
							onClick={onToggle}
							className="max-md:size-11"
							aria-label={toggleTitle}
							title={toggleTitle}
							icon={<ArrowRightIcon size={16} />}
						/>
					)}
					<Select
						className="w-28 max-md:h-11"
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
				</>
			}
		>
			<div ref={ref} className="min-h-0 flex-1">
				{height > 0 ? (
					<div
						role="img"
						aria-label={`${barLabel} by month in ${selectedYear}. Total ${formatCurrency(total)}.`}
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
			<div className="flex flex-wrap items-center justify-center gap-2 text-kumo-subtle text-sm">
				<span>Total for {selectedYear}</span>
				<SignedAmount
					amount={total}
					formatCurrency={formatCurrency}
					direction={direction}
					size="inline"
				/>
			</div>
		</ChartCard>
	);
}
