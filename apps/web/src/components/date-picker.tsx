import { Button, DatePicker, Input, Label } from "@cloudflare/kumo";
import { Popover } from "@cloudflare/kumo/components/popover";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { format, isValid, parse } from "date-fns";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Date pickers (docs/design.md §7.4). kumo ships `DatePicker` — the calendar
 * itself, with no input and no padding — so every date affordance here is that
 * calendar inside a kumo `Popover`. There are exactly two shapes:
 *
 * - `DateField`: a form control (label + DD/MM/YYYY input + calendar button).
 * - `DateFilterField`: a toolbar/filter trigger that shows the chosen day.
 *
 * Both hand back a local-midnight `Date`; callers keep doing their own
 * UTC-day conversion (`asUtcDay` / `toUtcDayIso` / `utcDayString`), so the value
 * that reaches the API or a URL param is unchanged from the old pickers.
 */

const DISPLAY_FORMAT = "dd/MM/yyyy";

type PickerTriggerProps = {
	value: Date | undefined;
	onChange: (date: Date) => void;
	disabled?: (date: Date) => boolean;
	align?: "start" | "end";
	/** The already-styled button that opens the calendar. */
	trigger: React.ReactElement;
	children?: React.ReactNode;
};

/** Shared popover plumbing: one kumo `DatePicker` inside one popover. */
function PickerPopover({
	value,
	onChange,
	disabled,
	align = "start",
	trigger,
	children,
}: PickerTriggerProps): React.JSX.Element {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger render={trigger}>{children}</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner align={align}>
					<Popover.Popup className="w-auto p-3">
						<DatePicker
							mode="single"
							selected={value}
							onChange={(date) => {
								if (!date) return;
								onChange(date);
								setOpen(false);
							}}
							disabled={disabled}
							autoFocus
						/>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}

type DateFieldProps = {
	id: string;
	label: string;
	value: Date | undefined;
	onChange: (date: Date) => void;
	disabled?: (date: Date) => boolean;
};

/**
 * Form date control: a typed DD/MM/YYYY input that auto-inserts the slashes,
 * plus a calendar button for the same value. Typing a complete valid date
 * commits immediately; an incomplete or out-of-range entry is flagged and
 * reverted on blur, so the form never holds a half-typed date.
 */
export function DateField({
	id,
	label,
	value,
	onChange,
	disabled,
}: DateFieldProps): React.JSX.Element {
	const [text, setText] = React.useState(() =>
		value ? format(value, DISPLAY_FORMAT) : "",
	);
	const [hasError, setHasError] = React.useState(false);

	// Keep the text in sync when the value changes elsewhere (e.g. the calendar).
	// Adjusted during render — not in an effect — so the field never flashes the
	// stale value. https://react.dev/learn/you-might-not-need-an-effect
	const [prevValue, setPrevValue] = React.useState(value);
	if (value && value !== prevValue) {
		setPrevValue(value);
		setText(format(value, DISPLAY_FORMAT));
		setHasError(false);
	}

	const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		let raw = event.target.value.replace(/[^\d/]/g, "");

		// Auto-insert the slashes after DD and MM.
		const digits = raw.replace(/\//g, "");
		if (digits.length <= 8) {
			raw = "";
			for (let i = 0; i < digits.length; i++) {
				if (i === 2 || i === 4) raw += "/";
				raw += digits[i];
			}
		}

		setText(raw);

		if (raw.length === 10) {
			const parsed = parse(raw, DISPLAY_FORMAT, new Date());
			if (!isValid(parsed) || (disabled?.(parsed) ?? false)) {
				setHasError(true);
			} else {
				setHasError(false);
				onChange(parsed);
			}
		} else {
			setHasError(false);
		}
	};

	const handleBlur = () => {
		if (text.length === 0) return;
		const parsed =
			text.length === 10 ? parse(text, DISPLAY_FORMAT, new Date()) : null;
		const valid =
			parsed !== null && isValid(parsed) && !(disabled?.(parsed) ?? false);
		if (!valid) {
			if (value) setText(format(value, DISPLAY_FORMAT));
			setHasError(false);
		}
	};

	const handlePick = (date: Date) => {
		onChange(date);
		setText(format(date, DISPLAY_FORMAT));
		setHasError(false);
	};

	return (
		<div className="flex flex-col gap-1.5">
			<Label htmlFor={id}>{label}</Label>
			<div className="flex gap-2">
				<Input
					id={id}
					type="text"
					inputMode="numeric"
					placeholder="DD/MM/YYYY"
					maxLength={10}
					value={text}
					onChange={handleTextChange}
					onBlur={handleBlur}
					className={cn("flex-1", hasError && "ring-kumo-danger")}
					aria-invalid={hasError}
				/>
				<PickerPopover
					value={value}
					onChange={handlePick}
					disabled={disabled}
					trigger={
						<Button
							variant="secondary"
							shape="square"
							type="button"
							className="shrink-0 max-md:size-11"
							aria-label={`Open calendar for ${label}`}
							icon={<CalendarBlankIcon size={16} />}
						/>
					}
				/>
			</div>
			{hasError ? (
				<p className="text-kumo-danger text-xs">
					Please enter a valid date in DD/MM/YYYY format
				</p>
			) : null}
		</div>
	);
}

type DateFilterFieldProps = {
	label: string;
	value: Date | undefined;
	onSelect: (date: Date) => void;
	placeholder?: string;
	disabled?: (date: Date) => boolean;
	className?: string;
	/** Shown under the trigger when the field is empty (filters only). */
	subtleWhenEmpty?: boolean;
};

/**
 * Toolbar/filter date trigger: "Pick date" until a day is chosen, then the day
 * itself. 44px tall below `md` like every other filter control.
 */
export function DateFilterField({
	label,
	value,
	onSelect,
	placeholder = "Pick date",
	disabled,
	className,
	subtleWhenEmpty = true,
}: DateFilterFieldProps): React.JSX.Element {
	return (
		<div className="flex flex-col gap-1.5">
			<Label className="font-medium text-kumo-subtle text-xs">{label}</Label>
			<PickerPopover
				value={value}
				onChange={onSelect}
				disabled={disabled}
				trigger={
					<Button
						variant="secondary"
						size="sm"
						className={cn(
							"justify-start text-left max-md:h-11",
							!value && subtleWhenEmpty && "text-kumo-subtle",
							className,
						)}
					/>
				}
			>
				{value ? format(value, "MMM d, yyyy") : placeholder}
			</PickerPopover>
		</div>
	);
}
