import { useQuery } from "@tanstack/react-query";
import {
	addMonths,
	addWeeks,
	addYears,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	setMonth,
	setYear,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";
import { useState } from "react";
import { api } from "@/lib/api";
import { categoryMark, useCategoryColorMode } from "@/lib/category-color";

type Period = "weekly" | "monthly" | "yearly";

interface CategoriesResponse {
	categories: Array<{
		name: string;
		amount: string;
		percentage: number;
		color: string;
	}>;
}

// Contract §10: a datum without a colour cycles `--chart-1..5` — nothing else exists.
const FALLBACK_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
] as const;

export function useCategoryBreakdownData(type: "income" | "expense") {
	const [period, setPeriod] = useState<Period>("monthly");
	const [currentDate, setCurrentDate] = useState(new Date());

	const getDateRange = () => {
		switch (period) {
			case "weekly":
				return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
			case "yearly":
				return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
			default:
				return {
					start: startOfMonth(currentDate),
					end: endOfMonth(currentDate),
				};
		}
	};

	const { start, end } = getDateRange();
	// Date-only "YYYY-MM-DD" params → dashboard.ts normalizes to UTC day
	// boundaries, so breakdown months match UTC bucketing everywhere (#22).
	const startDateParam = format(start, "yyyy-MM-dd");
	const endDateParam = format(end, "yyyy-MM-dd");

	const colorMode = useCategoryColorMode();

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: [
			`${type}-categories-breakdown`,
			period,
			startDateParam,
			endDateParam,
		],
		queryFn: async () => {
			const res = await api.get<CategoriesResponse>(
				`/api/dashboard/${type}-categories`,
				{
					params: { startDate: startDateParam, endDate: endDateParam },
				},
			);
			return res.data;
		},
	});

	const navigatePeriod = (direction: "prev" | "next") => {
		const amount = direction === "prev" ? -1 : 1;
		switch (period) {
			case "weekly":
				setCurrentDate(
					amount === -1 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1),
				);
				break;
			case "monthly":
				setCurrentDate(
					amount === -1 ? subMonths(currentDate, 1) : addMonths(currentDate, 1),
				);
				break;
			case "yearly":
				setCurrentDate(
					amount === -1 ? subYears(currentDate, 1) : addYears(currentDate, 1),
				);
				break;
		}
	};

	// Shared category palette (#19): the bar is the same mark the chip renders.
	const chartData = (data?.categories || [])
		.map((cat, index) => ({
			name: cat.name,
			amount: Number(cat.amount),
			percentage: cat.percentage,
			fill:
				categoryMark(cat.color, colorMode) ??
				FALLBACK_COLORS[index % FALLBACK_COLORS.length],
		}))
		.sort((a, b) => b.amount - a.amount);

	const total = chartData.reduce((sum, item) => sum + item.amount, 0);

	const currentYear = currentDate.getUTCFullYear();
	const currentMonth = currentDate.getUTCMonth();

	return {
		period,
		setPeriod,
		currentDate,
		setCurrentDate,
		start,
		end,
		data,
		isLoading,
		isError,
		refetch,
		chartData,
		total,
		navigatePeriod,
		currentYear,
		currentMonth,
		handleYearChange: (year: string) =>
			setCurrentDate(setYear(currentDate, Number(year))),
		handleMonthChange: (month: string) =>
			setCurrentDate(setMonth(currentDate, Number(month))),
	};
}
