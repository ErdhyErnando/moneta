import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { CurrencySelector } from "@/components/currency-selector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export type TimeRange = "7d" | "30d" | "90d" | "custom";

type DashboardHeaderProps = {
	timeRange: TimeRange;
	onTimeRangeChange: (value: TimeRange) => void;
	customStartDate: Date | undefined;
	customEndDate: Date | undefined;
	onCustomStartChange: (date: Date | undefined) => void;
	onCustomEndChange: (date: Date | undefined) => void;
};

// Time-range selector + custom date popovers for the dashboard (#49).
export function DashboardHeader({
	timeRange,
	onTimeRangeChange,
	customStartDate,
	customEndDate,
	onCustomStartChange,
	onCustomEndChange,
}: DashboardHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<h1 className="font-bold text-3xl">Dashboard</h1>
			<div className="flex items-center gap-2">
				<AddTransactionDialog />
				<CurrencySelector />
				<Select
					value={timeRange}
					onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select time range" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="7d">Last 7 days</SelectItem>
						<SelectItem value="30d">Last 30 days</SelectItem>
						<SelectItem value="90d">Last 90 days</SelectItem>
						<SelectItem value="custom">Custom range</SelectItem>
					</SelectContent>
				</Select>

				{timeRange === "custom" && (
					<>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-[140px] justify-start">
									<IconCalendar className="mr-2 size-4" />
									{customStartDate
										? format(customStartDate, "MMM dd, yyyy")
										: "Start date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={customStartDate}
									onSelect={onCustomStartChange}
									initialFocus
								/>
							</PopoverContent>
						</Popover>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" className="w-[140px] justify-start">
									<IconCalendar className="mr-2 size-4" />
									{customEndDate
										? format(customEndDate, "MMM dd, yyyy")
										: "End date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={customEndDate}
									onSelect={onCustomEndChange}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</>
				)}
			</div>
		</div>
	);
}
