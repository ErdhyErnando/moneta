"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive area chart for cash flow";

const chartConfig = {
	income: {
		label: "Income",
		color: "hsl(142 76% 36%)", // emerald-600
	},
	expense: {
		label: "Expense",
		color: "hsl(0 84% 60%)", // rose-500
	},
} satisfies ChartConfig;

interface ChartData {
	date: string;
	income: number;
	expense: number;
}

interface ChartAreaInteractiveProps {
	data?: ChartData[];
	isLoading?: boolean;
}

export function ChartAreaInteractive({
	data = [],
	isLoading = false,
}: ChartAreaInteractiveProps) {
	return (
		<Card>
			<CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
				<div className="grid flex-1 gap-1 text-center sm:text-left">
					<CardTitle>Cash Flow</CardTitle>
					<CardDescription>Income vs Expenses over time</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="px-1 pt-1 sm:px-2 sm:pt-2 sm:pb-4">
				{isLoading ? (
					<div className="flex h-[280px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : data.length === 0 ? (
					<div className="flex h-[250px] items-center justify-center text-muted-foreground">
						No data available for the selected time range
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full"
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
				)}
			</CardContent>
		</Card>
	);
}
