import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
		<div className="mb-6 flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="icon"
				className="shrink-0"
				onClick={() => onNavigate("prev")}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<div className="flex items-center gap-2">
				{period !== "yearly" && (
					<Select value={String(currentMonth)} onValueChange={onMonthChange}>
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
				<Select value={String(currentYear)} onValueChange={onYearChange}>
					<SelectTrigger className="w-[90px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{YEAR_OPTIONS.map((year) => (
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
				onClick={() => onNavigate("next")}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
