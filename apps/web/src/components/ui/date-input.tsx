import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DateInputProps = {
	value: Date | undefined;
	onChange: (date: Date) => void;
	label?: string;
	id?: string;
	disabled?: (date: Date) => boolean;
};

function DateInput({ value, onChange, label, id, disabled }: DateInputProps) {
	const [textValue, setTextValue] = React.useState(() =>
		value ? format(value, "dd/MM/yyyy") : "",
	);
	const [open, setOpen] = React.useState(false);
	const [hasError, setHasError] = React.useState(false);

	// Keep text in sync when value changes externally (e.g. calendar pick)
	const lastExternalValue = React.useRef<Date | undefined>(value);
	React.useEffect(() => {
		if (value && value !== lastExternalValue.current) {
			setTextValue(format(value, "dd/MM/yyyy"));
			setHasError(false);
			lastExternalValue.current = value;
		}
	}, [value]);

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let raw = e.target.value;

		// Only allow digits and slashes
		raw = raw.replace(/[^\d/]/g, "");

		// Auto-insert slashes after DD and MM
		const digitsOnly = raw.replace(/\//g, "");
		if (digitsOnly.length <= 8) {
			let formatted = "";
			for (let i = 0; i < digitsOnly.length; i++) {
				if (i === 2 || i === 4) {
					formatted += "/";
				}
				formatted += digitsOnly[i];
			}
			raw = formatted;
		}

		setTextValue(raw);

		// Try to parse when we have a full date string
		if (raw.length === 10) {
			const parsed = parse(raw, "dd/MM/yyyy", new Date());
			if (isValid(parsed)) {
				const isDisabled = disabled?.(parsed) ?? false;
				if (!isDisabled) {
					setHasError(false);
					lastExternalValue.current = parsed;
					onChange(parsed);
				} else {
					setHasError(true);
				}
			} else {
				setHasError(true);
			}
		} else {
			setHasError(false);
		}
	};

	const handleBlur = () => {
		// On blur, if text is incomplete or invalid, reset to current value
		if (textValue.length > 0 && textValue.length < 10) {
			if (value) {
				setTextValue(format(value, "dd/MM/yyyy"));
			}
			setHasError(false);
		} else if (textValue.length === 10) {
			const parsed = parse(textValue, "dd/MM/yyyy", new Date());
			if (!isValid(parsed) || (disabled && disabled(parsed))) {
				if (value) {
					setTextValue(format(value, "dd/MM/yyyy"));
				}
				setHasError(false);
			}
		}
	};

	const handleCalendarSelect = (date: Date | undefined) => {
		if (date) {
			lastExternalValue.current = date;
			onChange(date);
			setTextValue(format(date, "dd/MM/yyyy"));
			setHasError(false);
			setOpen(false);
		}
	};

	return (
		<div className="flex flex-col space-y-2">
			{label && <Label htmlFor={id}>{label}</Label>}
			<div className="flex gap-2">
				<Input
					id={id}
					type="text"
					inputMode="numeric"
					placeholder="DD/MM/YYYY"
					maxLength={10}
					value={textValue}
					onChange={handleTextChange}
					onBlur={handleBlur}
					className={cn(
						"flex-1",
						hasError &&
							"border-destructive ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/50",
					)}
				/>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="shrink-0"
							type="button"
						>
							<CalendarIcon className="h-4 w-4" />
							<span className="sr-only">Open calendar</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="end">
						<Calendar
							mode="single"
							selected={value}
							onSelect={handleCalendarSelect}
							disabled={disabled}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
			{hasError && (
				<p className="text-destructive text-xs">
					Please enter a valid date in DD/MM/YYYY format
				</p>
			)}
		</div>
	);
}

export { DateInput };
