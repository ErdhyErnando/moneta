import { Select } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// recharts ships in an async chunk: this module loads only via React.lazy
// in routes/_authenticated/assets.tsx, never in the initial bundle (#48).
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
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

/**
 * Asset value by month. Card chrome comes from the shared `ChartCard`
 * (§7.2/§7.8/#10) so this card has the same header, skeleton, empty and error
 * states as every other chart; the plot itself is untouched until Phase 5.
 */
export function AssetsChart(): React.JSX.Element {
	const { formatCurrency } = useCurrency();
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

	return (
		<ChartCard
			title="Asset value"
			description={`Total holdings by month for ${selectedYear}`}
			height="base"
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
			<div className="flex h-full flex-col">
				<ChartContainer config={chartConfig} className="h-50 w-full">
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
				<p className="mt-4 text-center text-kumo-subtle text-sm tabular-nums">
					Total for {selectedYear}: {formatCurrency(totalAssets)}
				</p>
			</div>
		</ChartCard>
	);
}
