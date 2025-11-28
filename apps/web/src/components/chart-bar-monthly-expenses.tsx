"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
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
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

interface MonthlyExpenseData {
	month: string;
	amount: number;
}

interface MonthlyExpensesResponse {
	monthlyData: Array<{
		month: string;
		amount: string;
	}>;
}

const chartConfig = {
	amount: {
		label: "Expenses",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

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

export function ChartBarMonthlyExpenses() {
	const { formatCurrency } = useCurrency();
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(currentYear.toString());

	// Generate year options (current year + 4 previous years)
	const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const { data, isLoading } = useQuery({
		queryKey: ["monthly-expenses", selectedYear],
		queryFn: async () => {
			const response = await api.get<MonthlyExpensesResponse>(
				`/api/dashboard/monthly-expenses?year=${selectedYear}`,
			);
			return response.data;
		},
	});

	// Transform data for the chart - ensure all 12 months are present
	const chartData: MonthlyExpenseData[] = MONTH_NAMES.map((month, index) => {
		const monthData = data?.monthlyData.find((d) => {
			const monthIndex = new Date(d.month).getMonth();
			return monthIndex === index;
		});

		return {
			month,
			amount: monthData ? Number(monthData.amount) : 0,
		};
	});

	const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Monthly Expenses</CardTitle>
						<CardDescription>
							Expenses by month for {selectedYear}
						</CardDescription>
					</div>
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className="w-[120px]">
							<SelectValue placeholder="Select year" />
						</SelectTrigger>
						<SelectContent>
							{yearOptions.map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : (
					<>
						<ChartContainer config={chartConfig}>
							<BarChart
								accessibilityLayer
								data={chartData}
								layout="vertical"
								margin={{
									right: 16,
								}}
							>
								<CartesianGrid horizontal={false} />
								<YAxis
									dataKey="month"
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
										dataKey="month"
										position="insideLeft"
										offset={8}
										className="fill-background"
										fontSize={12}
									/>
									<LabelList
										dataKey="amount"
										position="right"
										offset={8}
										className="fill-foreground"
										fontSize={12}
										formatter={(value: number) =>
											value > 0 ? formatCurrency(value) : ""
										}
									/>
								</Bar>
							</BarChart>
						</ChartContainer>
						<div className="mt-4 text-center">
							<p className="text-muted-foreground text-sm">
								Total for {selectedYear}: {formatCurrency(totalExpenses)}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
