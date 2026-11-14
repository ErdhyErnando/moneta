// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/index.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
	income: {
		label: "Income",
		color: "var(--color-positive)",
	},
	expense: {
		label: "Expense",
		color: "var(--color-negative)",
	},
} satisfies ChartConfig;

interface ChartData {
	date: string;
	income: number;
	expense: number;
}

const EMPTY_CHART_DATA: ChartData[] = [];

interface ChartAreaInteractiveProps {
	data?: ChartData[];
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
}

export function ChartAreaInteractive({
	data = EMPTY_CHART_DATA,
	isLoading = false,
	isError = false,
	onRetry,
}: ChartAreaInteractiveProps) {
	return (
		<ChartCard
			title="Cash Flow"
			description="Income vs expenses over time"
			height="base"
			isLoading={isLoading}
			isError={isError}
			onRetry={onRetry}
			isEmpty={data.length === 0}
			emptyTitle="No cash flow in this period"
			emptyDescription="Try a wider date range from the period filter."
		>
			<ChartContainer
				config={chartConfig}
				className="!flex-1 aspect-auto h-full w-full"
			>
				<AreaChart
					accessibilityLayer
					data={data}
					margin={{
						left: 12,
						right: 12,
						bottom: 10,
					}}
				>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey="date"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						minTickGap={32}
						tickFormatter={(value) => {
							const date = new Date(value);
							return date.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
							});
						}}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(value) => {
									return new Date(value).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									});
								}}
								indicator="dot"
							/>
						}
					/>
					<defs>
						<linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor="var(--color-income)"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="var(--color-income)"
								stopOpacity={0.1}
							/>
						</linearGradient>
						<linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
							<stop
								offset="5%"
								stopColor="var(--color-expense)"
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor="var(--color-expense)"
								stopOpacity={0.1}
							/>
						</linearGradient>
					</defs>
					<Area
						dataKey="expense"
						type="natural"
						fill="url(#fillExpense)"
						fillOpacity={0.3}
						stroke="var(--color-expense)"
						strokeWidth={2}
					/>
					<Area
						dataKey="income"
						type="natural"
						fill="url(#fillIncome)"
						fillOpacity={0.3}
						stroke="var(--color-income)"
						strokeWidth={2}
					/>
				</AreaChart>
			</ChartContainer>
		</ChartCard>
	);
}
