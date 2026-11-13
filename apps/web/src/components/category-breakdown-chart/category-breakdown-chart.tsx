// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/expense_.breakdown.tsx + income_.breakdown.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import

import { LayerCard, Tabs } from "@cloudflare/kumo";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useCurrency } from "@/contexts/currency-context";
import { BreakdownPeriodNav } from "./breakdown-period-nav";
import { useCategoryBreakdownData } from "./use-category-breakdown-data";

interface Props {
	type: "income" | "expense";
}

export function CategoryBreakdownChart({ type }: Props) {
	const { formatCurrency } = useCurrency();
	const {
		period,
		setPeriod,
		setCurrentDate,
		start,
		end,
		isLoading,
		chartData,
		total,
		navigatePeriod,
		currentYear,
		currentMonth,
		handleYearChange,
		handleMonthChange,
	} = useCategoryBreakdownData(type);

	const chartConfig: ChartConfig = chartData.reduce(
		(config, item) => {
			config[item.name] = { label: item.name, color: item.fill };
			return config;
		},
		{ amount: { label: "Amount" } } as ChartConfig,
	);

	const chartHeight = Math.max(300, chartData.length * 56);

	return (
		<LayerCard className="w-full gap-0 rounded-xl p-0 shadow-none">
			<div className="flex flex-col gap-4 px-6 pt-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="font-semibold text-base capitalize">
						{type} Breakdown by Category
					</div>
					<div className="text-kumo-subtle text-sm">
						Visualize your {type} across different categories
					</div>
				</div>
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
			</div>
			<div className="px-6 pb-6">
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
				{isLoading ? (
					<div className="h-[300px] animate-pulse rounded-lg bg-kumo-fill" />
				) : chartData.length === 0 ? (
					<div className="flex h-[300px] items-center justify-center text-kumo-subtle">
						No {type} data found for this period
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="w-full"
						style={{ height: `${chartHeight}px` }}
					>
						<BarChart
							accessibilityLayer
							data={chartData}
							layout="vertical"
							margin={{ right: 32, left: 32, top: 8, bottom: 8 }}
						>
							<CartesianGrid horizontal={false} />
							<YAxis
								dataKey="name"
								type="category"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								hide
							/>
							<XAxis dataKey="amount" type="number" hide />
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										indicator="line"
										formatter={(value) => formatCurrency(Number(value))}
									/>
								}
							/>
							<Bar
								dataKey="amount"
								layout="vertical"
								fill="var(--color-amount)"
								radius={4}
							>
								<LabelList
									dataKey="name"
									position="insideLeft"
									offset={12}
									className="fill-background font-medium"
									fontSize={12}
								/>
								<LabelList
									dataKey="amount"
									position="right"
									offset={12}
									className="fill-foreground font-semibold"
									fontSize={12}
									formatter={(value: number) => formatCurrency(value)}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
				{!isLoading && chartData.length > 0 && (
					<div className="mt-6 border-kumo-hairline border-t pt-4 text-center">
						<p className="text-kumo-subtle text-sm">
							Total {type}:{" "}
							<span className="font-bold text-kumo-default tabular-nums">
								{formatCurrency(total)}
							</span>
						</p>
					</div>
				)}
			</div>
		</LayerCard>
	);
}
