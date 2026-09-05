import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/assets.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

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

const chartConfig = {
	amount: {
		label: "Assets",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export function AssetsChart() {
	const { formatCurrency } = useCurrency();
	// Use UTC year to match server DATE_TRUNC UTC per #22
	const currentYear = new Date().getUTCFullYear();
	const [selectedYear, setSelectedYear] = useState(() =>
		currentYear.toString(),
	);

	const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const { data, isLoading } = useQuery({
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

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Asset Value</CardTitle>
						<CardDescription>
							Total holdings by month for {selectedYear}
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
					<div className="flex h-[200px] items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					</div>
				) : (
					<>
						<ChartContainer config={chartConfig} className="h-[200px] w-full">
							<AreaChart
								accessibilityLayer
								data={chartData}
								margin={{
									left: 12,
									right: 12,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											indicator="line"
											formatter={(value) => formatCurrency(Number(value))}
										/>
									}
								/>
								<Area
									dataKey="amount"
									type="natural"
									fill="var(--color-amount)"
									fillOpacity={0.3}
									stroke="var(--color-amount)"
									strokeWidth={2}
								/>
							</AreaChart>
						</ChartContainer>
						<div className="mt-4 text-center">
							<p className="text-muted-foreground text-sm">
								Total for {selectedYear}: {formatCurrency(totalAssets)}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
