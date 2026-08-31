import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
			<Label className="font-medium text-muted-foreground text-xs">
				{label}
			</Label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className={cn(
							"h-8 w-[140px] justify-start text-left font-normal",
							!selected && "text-muted-foreground",
						)}
					>
						{selected ? format(selected, "MMM d, yyyy") : placeholder}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={selected}
						onSelect={(day) => onSelect(day ? utcDayString(day) : "")}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
