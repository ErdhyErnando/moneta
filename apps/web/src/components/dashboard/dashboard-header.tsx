import { Button, Select } from "@cloudflare/kumo";
import { Popover } from "@cloudflare/kumo/components/popover";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { CurrencySelector } from "@/components/currency-selector";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { PageHeader } from "@/components/layout";
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

const RANGE_LABELS: Record<Exclude<TimeRange, "custom">, string> = {
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	"90d": "Last 90 days",
};

const RANGE_ITEMS = [
	{ label: RANGE_LABELS["7d"], value: "7d" },
	{ label: RANGE_LABELS["30d"], value: "30d" },
	{ label: RANGE_LABELS["90d"], value: "90d" },
	{ label: "Custom range", value: "custom" },
];

function describeRange(
	timeRange: TimeRange,
	start: Date | undefined,
	end: Date | undefined,
): string {
	if (timeRange !== "custom") {
		return RANGE_LABELS[timeRange];
	}
	if (!start || !end) {
		return "Custom range";
	}
	return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

/**
 * Page header for the dashboard (docs/design.md §7.1): the period filter and the
 * single primary CTA. The CTA hides below `md` because the bottom nav already
 * carries a "+" that opens the same sheet (decision D4).
 */
export function DashboardHeader({
	timeRange,
	onTimeRangeChange,
	customStartDate,
	customEndDate,
	onCustomStartChange,
	onCustomEndChange,
}: DashboardHeaderProps): React.JSX.Element {
	return (
		<PageHeader
			title="Dashboard"
			description={describeRange(timeRange, customStartDate, customEndDate)}
			actions={
				<>
					<Select
						className="w-44 max-md:h-11"
						aria-label="Time range"
						placeholder="Select time range"
						value={timeRange}
						onValueChange={(value) => {
							if (value) onTimeRangeChange(value as TimeRange);
						}}
						items={RANGE_ITEMS}
					/>

					{timeRange === "custom" && (
						<>
							<Popover.Root>
								<Popover.Trigger
									render={
										<Button
											variant="secondary"
											className="w-40 justify-start max-md:h-11"
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
											className="w-40 justify-start max-md:h-11"
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

					<CurrencySelector />
					<AddTransactionDialog className="max-md:hidden" />
				</>
			}
		/>
	);
}
