import { Button, Select } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { format } from "date-fns";

// Module-scope statics per #25/#27
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

const START_YEAR = 2020;
const END_YEAR = new Date().getUTCFullYear();
const YEAR_OPTIONS = Array.from(
	{ length: END_YEAR - START_YEAR + 1 },
	(_, i) => START_YEAR + i,
);

type Props = {
	period: "weekly" | "monthly" | "yearly";
	currentMonth: number;
	currentYear: number;
	start: Date;
	end: Date;
	onNavigate: (direction: "prev" | "next") => void;
	onMonthChange: (month: string) => void;
	onYearChange: (year: string) => void;
};

export function BreakdownPeriodNav({
	period,
	currentMonth,
	currentYear,
	start,
	end,
	onNavigate,
	onMonthChange,
	onYearChange,
}: Props) {
	return (
		<div className="flex w-full items-center justify-center gap-1.5 sm:gap-2">
			<Button
				variant="secondary"
				shape="square"
				className="shrink-0 max-md:size-11"
				onClick={() => onNavigate("prev")}
				aria-label="Previous period"
				icon={<CaretLeftIcon size={16} />}
			/>
			<div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:flex-none sm:gap-2">
				{period !== "yearly" && (
					<Select
						className="min-w-0 flex-1 max-md:h-11 sm:w-32 sm:flex-none"
						aria-label="Month"
						value={String(currentMonth)}
						onValueChange={(value) => {
							if (value) onMonthChange(value);
						}}
						items={MONTHS.map((month, index) => ({
							label: month,
							value: String(index),
						}))}
					/>
				)}
				<Select
					className="w-20 shrink-0 max-md:h-11 sm:w-22"
					aria-label="Year"
					value={String(currentYear)}
					onValueChange={(value) => {
						if (value) onYearChange(value);
					}}
					items={YEAR_OPTIONS.map((year) => ({
						label: String(year),
						value: String(year),
					}))}
				/>
				{period === "weekly" && (
					<span className="whitespace-nowrap text-kumo-subtle text-sm">
						{format(start, "MMM d")} - {format(end, "MMM d")}
					</span>
				)}
			</div>
			<Button
				variant="secondary"
				shape="square"
				className="shrink-0 max-md:size-11"
				onClick={() => onNavigate("next")}
				aria-label="Next period"
				icon={<CaretRightIcon size={16} />}
			/>
		</div>
	);
}
