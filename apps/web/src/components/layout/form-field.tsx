import { Field } from "@cloudflare/kumo/components/field";
import type * as React from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
	/** Visible label, always above the control (docs/design.md §7.4). */
	label: React.ReactNode;
	/** Renders an asterisk in the label; the control carries `aria-required`. */
	required?: boolean;
	/** Helper text under the control; replaced by `error` when present. */
	helper?: React.ReactNode;
	/** Error text; passing it switches the field to its invalid state. */
	error?: React.ReactNode;
	/** The control (kumo Input/Select/…) — it owns its own id/aria wiring. */
	children: React.ReactNode;
	className?: string;
};

/**
 * Form field wrapper: label above the control, helper/error below
 * (docs/design.md §7.4). Built on kumo's `Field` so label ↔ control association,
 * `aria-describedby` and the error state stay identical across every form.
 *
 * `Field` handles spacing and association; this wrapper only adds the required
 * marker (kumo's `required={false}` renders "(optional)" instead, which is not
 * the Moneta convention).
 */
export function FormField({
	label,
	required,
	helper,
	error,
	children,
	className,
}: FormFieldProps): React.JSX.Element {
	return (
		<div data-slot="form-field" className={cn(className)}>
			<Field
				label={
					required ? (
						<span className="inline-flex items-center gap-1">
							{label}
							<span aria-hidden="true" className="text-kumo-danger">
								*
							</span>
						</span>
					) : (
						label
					)
				}
				description={error ? undefined : helper}
				error={
					error === undefined
						? undefined
						: { message: error, match: "customError" as const }
				}
			>
				{children}
			</Field>
		</div>
	);
}
