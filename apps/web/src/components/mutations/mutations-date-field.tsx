import { Button, Label } from "@cloudflare/kumo";
import { Popover } from "@cloudflare/kumo/components/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { utcDayString } from "@/lib/date";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	/** date-only "YYYY-MM-DD" string ("" = unset) */
	value: string;
	placeholder?: string;
	onSelect: (dayOnly: string) => void;
};

/**
 * Date filter emitting date-only "YYYY-MM-DD" strings — mutations.ts and
 * dashboard.ts normalize those to UTC day boundaries, matching the canonical
 * UTC-calendar-day storage (#33).
 */
export function MutationsDateField({
	label,
	value,
	placeholder = "Pick date",
	onSelect,
}: Props) {
	const selected = value ? new Date(`${value}T00:00:00`) : undefined;

	return (
		<div className="flex flex-col gap-1.5">
			<Label className="font-medium text-kumo-subtle text-xs">{label}</Label>
			<Popover.Root>
				<Popover.Trigger
					render={
						<Button
							variant="secondary"
							size="sm"
							className={cn(
								"w-36 justify-start text-left max-md:h-11",
								!selected && "text-kumo-subtle",
							)}
						/>
					}
				>
					{selected ? format(selected, "MMM d, yyyy") : placeholder}
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Positioner align="start">
						<Popover.Popup className="w-auto p-0">
							<Calendar
								mode="single"
								selected={selected}
								onSelect={(day) => onSelect(day ? utcDayString(day) : "")}
								initialFocus
							/>
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
}
