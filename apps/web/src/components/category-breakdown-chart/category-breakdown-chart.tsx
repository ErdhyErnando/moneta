"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/contexts/currency-context";
import { useCategoryBreakdownData } from "./use-category-breakdown-data";

// Module-scope per #25
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

interface Props {
	type: "income" | "expense";
}

export function CategoryBreakdownChart({ type }: Props) {
	const { formatCurrency } = useCurrency();
	const {
		period,
		setPeriod,
		currentDate,
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

	const START_YEAR = 2020;
	const END_YEAR = new Date().getUTCFullYear();
	const yearOptions = Array.from(
		{ length: END_YEAR - START_YEAR + 1 },
		(_, i) => START_YEAR + i,
	);
	const chartHeight = Math.max(300, chartData.length * 56);

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="capitalize">
							{type} Breakdown by Category
						</CardTitle>
						<CardDescription>
							Visualize your {type} across different categories
						</CardDescription>
					</div>
					<Tabs
						value={period}
						onValueChange={(v) => {
							setPeriod(v as never);
							setCurrentDate(new Date());
						}}
					>
						<TabsList>
							<TabsTrigger value="weekly">Weekly</TabsTrigger>
							<TabsTrigger value="monthly">Monthly</TabsTrigger>
							<TabsTrigger value="yearly">Yearly</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</CardHeader>
			<CardContent>
				<div className="mb-6 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="shrink-0"
						onClick={() => navigatePeriod("prev")}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2">
						{period !== "yearly" && (
							<Select
								value={String(currentMonth)}
								onValueChange={handleMonthChange}
							>
								<SelectTrigger className="w-[130px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{MONTHS.map((month, index) => (
										<SelectItem key={month} value={String(index)}>
											{month}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<Select
							value={String(currentYear)}
							onValueChange={handleYearChange}
						>
							<SelectTrigger className="w-[90px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{yearOptions.map((year) => (
									<SelectItem key={year} value={String(year)}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{period === "weekly" && (
							<span className="text-muted-foreground text-sm">
								{format(start, "MMM d")} - {format(end, "MMM d")}
							</span>
						)}
					</div>
					<Button
						variant="outline"
						size="icon"
						className="shrink-0"
						onClick={() => navigatePeriod("next")}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : chartData.length === 0 ? (
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
					<div className="mt-6 border-t pt-4 text-center">
						<p className="text-muted-foreground text-sm">
							Total {type}:{" "}
							<span className="font-bold text-foreground">
								{formatCurrency(total)}
							</span>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
