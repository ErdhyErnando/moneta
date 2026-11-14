import { DateFilterField } from "@/components/date-picker";
import { utcDayString } from "@/lib/date";

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
 *
 * This is only the string adapter: the picker itself is the shared
 * `DateFilterField`, so the URL value stays a bare `YYYY-MM-DD` day.
 */
export function MutationsDateField({
	label,
	value,
	placeholder = "Pick date",
	onSelect,
}: Props): React.JSX.Element {
	const selected = value ? new Date(`${value}T00:00:00`) : undefined;

	return (
		<DateFilterField
			label={label}
			value={selected}
			onSelect={(day) => onSelect(utcDayString(day))}
			placeholder={placeholder}
			className="w-36"
		/>
	);
}
