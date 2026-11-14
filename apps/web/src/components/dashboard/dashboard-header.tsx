import { Select } from "@cloudflare/kumo";
import { format } from "date-fns";
import { CurrencySelector } from "@/components/currency-selector";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { DateFilterField } from "@/components/date-picker";
import { PageHeader } from "@/components/layout";

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
							<DateFilterField
								label="From"
								value={customStartDate}
								onSelect={onCustomStartChange}
								placeholder="Start date"
								className="w-40"
							/>
							<DateFilterField
								label="To"
								value={customEndDate}
								onSelect={onCustomEndChange}
								placeholder="End date"
								className="w-40"
							/>
						</>
					)}

					<CurrencySelector />
					<AddTransactionDialog className="max-md:hidden" />
				</>
			}
		/>
	);
}
