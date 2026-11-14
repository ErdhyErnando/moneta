// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/expense_.breakdown.tsx + income_.breakdown.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import

import { Tabs } from "@cloudflare/kumo";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { SignedAmount } from "@/components/money/signed-amount";
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

	const chartConfig: ChartConfig = chartData.reduce(
		(config, item) => {
			config[item.name] = { label: item.name, color: item.fill };
			return config;
		},
		{ amount: { label: "Amount" } } as ChartConfig,
	);

	const chartHeight = Math.max(300, chartData.length * 56);

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
