import { Button, Select } from "@cloudflare/kumo";
import { ArrowRightIcon } from "@phosphor-icons/react";
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
import { ChartCard } from "@/components/charts/chart-card";
import { SignedAmount } from "@/components/money/signed-amount";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
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
	/** Which P&L token the bars and the total carry (§2.4, §2.5). */
	direction: "positive" | "negative";
	toggleTitle: string;
	onToggle?: () => void;
};

export function MonthlyBarChart({
	title,
	descriptionPrefix,
	queryKeyBase,
	endpoint,
	barLabel,
	direction,
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
			({
				amount: {
					label: barLabel,
					color:
						direction === "positive"
							? "var(--color-positive)"
							: "var(--color-negative)",
				},
			}) satisfies ChartConfig,
		[barLabel, direction],
	);

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
	const hasData = (data?.monthlyData.length ?? 0) > 0;

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
			<div className="min-h-0 flex-1">
				<ChartContainer config={chartConfig} className="h-full w-full">
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
