import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { dayEndIso, dayStartIso } from "@/lib/mutations";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	value: string;
	/** "start" anchors to 00:00, "end" anchors to 23:59:59.999 of the picked day */
	kind: "start" | "end";
	placeholder?: string;
	onSelect: (iso: string) => void;
};

/** ISO date value backed by a calendar popover (#33 toolbar). */
export function MutationsDateField({
	label,
	value,
	kind,
	placeholder = "Pick date",
	onSelect,
}: Props) {
	const selected = value ? new Date(value) : undefined;
	const invalid = selected !== undefined && Number.isNaN(selected.getTime());
	const day = invalid ? undefined : selected;

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
							!day && "text-muted-foreground",
						)}
					>
						{day ? format(day, "MMM d, yyyy") : placeholder}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={day}
						onSelect={(d) =>
							onSelect(
								d ? (kind === "end" ? dayEndIso(d) : dayStartIso(d)) : "",
							)
						}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
