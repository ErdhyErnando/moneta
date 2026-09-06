import { IconArrowRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/index.tsx, never in the initial bundle (#48, #49).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
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
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

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
	barColor: string;
	toggleTitle: string;
	onToggle?: () => void;
};

export function MonthlyBarChart({
	title,
	descriptionPrefix,
	queryKeyBase,
	endpoint,
	barLabel,
	barColor,
	toggleTitle,
	onToggle,
}: MonthlyBarChartProps) {
	const { formatCurrency } = useCurrency();
	// Use UTC year to match server DATE_TRUNC UTC per #22
	const currentYear = new Date().getUTCFullYear();
	const [selectedYear, setSelectedYear] = useState(() =>
		currentYear.toString(),
	);

	// Generate year options (current year + 4 previous years)
	const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const chartConfig = useMemo(
		() =>
			({ amount: { label: barLabel, color: barColor } }) satisfies ChartConfig,
		[barLabel, barColor],
	);

	const { data, isLoading } = useQuery({
		queryKey: [queryKeyBase, selectedYear],
		queryFn: async () => {
			const response = await api.get<MonthlyBarResponse>(
				endpoint(selectedYear),
			);
			return response.data;
		},
	});

	// Transform data for the chart - ensure all 12 months are present
	// Parse month directly from string (format: "YYYY-MM-01") to avoid timezone issues
	const chartData: MonthlyDatum[] = MONTH_NAMES.map((month, index) => {
		const monthData = data?.monthlyData.find((d) => {
			// Extract month from "YYYY-MM-01" format (MM is 1-indexed, so subtract 1)
			const monthIndex = Number.parseInt(d.month.split("-")[1], 10) - 1;
			return monthIndex === index;
		});

		return {
			month,
			amount: monthData ? Number(monthData.amount) : 0,
		};
	});

	const total = chartData.reduce((sum, item) => sum + item.amount, 0);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div>
							<CardTitle>{title}</CardTitle>
							<CardDescription>
								{descriptionPrefix} for {selectedYear}
							</CardDescription>
						</div>
						{onToggle && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onToggle}
								className="ml-2"
								title={toggleTitle}
							>
								<IconArrowRight className="h-4 w-4" />
							</Button>
						)}
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
					<div className="flex h-[200px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : (
					<>
						<ChartContainer
							config={chartConfig}
							className="max-h-[300px] w-full"
						>
							<BarChart
								accessibilityLayer
								data={chartData}
								layout="vertical"
								margin={{
									right: 16,
									left: 8,
									top: 8,
									bottom: 8,
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
									radius={3}
								>
									<LabelList
										dataKey="month"
										position="insideLeft"
										offset={8}
										className="fill-background"
										fontSize={10}
									/>
									<LabelList
										dataKey="amount"
										position="right"
										offset={8}
										className="fill-foreground"
										fontSize={10}
										formatter={(value: number) =>
											value > 0 ? formatCurrency(value) : ""
										}
									/>
								</Bar>
							</BarChart>
						</ChartContainer>
						<div className="mt-4 text-center">
							<p className="text-muted-foreground text-sm">
								Total for {selectedYear}: {formatCurrency(total)}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
