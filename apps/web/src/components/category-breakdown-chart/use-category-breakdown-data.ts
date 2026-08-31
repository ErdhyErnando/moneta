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

type Period = "weekly" | "monthly" | "yearly";

interface CategoriesResponse {
	categories: Array<{
		name: string;
		amount: string;
		percentage: number;
		color: string;
	}>;
}

const FALLBACK_COLORS = [
	"oklch(0.6368 0.2078 25.3313)",
	"oklch(0.65 0.2 45)",
	"oklch(0.7 0.15 70)",
	"oklch(0.6 0.2 15)",
	"oklch(0.55 0.18 35)",
	"oklch(0.5 0.2 25)",
	"oklch(0.68 0.18 160)",
	"oklch(0.65 0.15 190)",
] as const;

function getCategoryFill(color: string | undefined, index: number): string {
	if (color && /^#[0-9a-fA-F]{6}$/.test(color)) return color;
	return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

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

	const { data, isLoading } = useQuery({
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

	const chartData = (data?.categories || [])
		.map((cat, index) => ({
			name: cat.name,
			amount: Number(cat.amount),
			percentage: cat.percentage,
			fill: getCategoryFill(cat.color, index),
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
