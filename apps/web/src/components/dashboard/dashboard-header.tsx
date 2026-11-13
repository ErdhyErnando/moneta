import { Button, Select } from "@cloudflare/kumo";
import { Popover } from "@cloudflare/kumo/components/popover";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { CurrencySelector } from "@/components/currency-selector";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { Calendar } from "@/components/ui/calendar";

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
		<div className="flex flex-wrap items-center justify-between gap-3">
			<h1 className="font-bold text-2xl sm:text-3xl">Dashboard</h1>
			<div className="flex flex-wrap items-center gap-2">
				<AddTransactionDialog />
				<CurrencySelector />
				<Select
					size="sm"
					className="w-[180px]"
					aria-label="Time range"
					placeholder="Select time range"
					value={timeRange}
					onValueChange={(value) => {
						if (value) onTimeRangeChange(value as TimeRange);
					}}
					items={[
						{ label: "Last 7 days", value: "7d" },
						{ label: "Last 30 days", value: "30d" },
						{ label: "Last 90 days", value: "90d" },
						{ label: "Custom range", value: "custom" },
					]}
				/>

				{timeRange === "custom" && (
					<>
						<Popover.Root>
							<Popover.Trigger
								render={
									<Button
										variant="secondary"
										size="sm"
										className="w-[140px] justify-start"
										icon={<CalendarBlankIcon size={16} />}
									/>
								}
							>
								{customStartDate
									? format(customStartDate, "MMM dd, yyyy")
									: "Start date"}
							</Popover.Trigger>
							<Popover.Portal>
								<Popover.Positioner align="start">
									<Popover.Popup className="w-auto p-0">
										<Calendar
											mode="single"
											selected={customStartDate}
											onSelect={onCustomStartChange}
											initialFocus
										/>
									</Popover.Popup>
								</Popover.Positioner>
							</Popover.Portal>
						</Popover.Root>

						<Popover.Root>
							<Popover.Trigger
								render={
									<Button
										variant="secondary"
										size="sm"
										className="w-[140px] justify-start"
										icon={<CalendarBlankIcon size={16} />}
									/>
								}
							>
								{customEndDate
									? format(customEndDate, "MMM dd, yyyy")
									: "End date"}
							</Popover.Trigger>
							<Popover.Portal>
								<Popover.Positioner align="start">
									<Popover.Popup className="w-auto p-0">
										<Calendar
											mode="single"
											selected={customEndDate}
											onSelect={onCustomEndChange}
											initialFocus
										/>
									</Popover.Popup>
								</Popover.Positioner>
							</Popover.Portal>
						</Popover.Root>
					</>
				)}
			</div>
		</div>
	);
}
