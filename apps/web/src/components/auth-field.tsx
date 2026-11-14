import { Input } from "@cloudflare/kumo";
import type { AnyFieldApi } from "@tanstack/react-form";
import type * as React from "react";

type AuthFieldProps = {
	field: AnyFieldApi;
	label: string;
	type?: string;
	autoComplete?: string;
};

/**
 * One auth text field (§7.4): label above the control, validation message below
 * it, and the native `required` marker — never colour-only.
 *
 * Callers keep their own `<form.Field>` wrapper so the field name stays typed.
 */
export function AuthField({
	field,
	label,
	type,
	autoComplete,
}: AuthFieldProps): React.JSX.Element {
	return (
		<Input
			label={
				<span className="inline-flex items-center gap-1">
					{label}
					<span aria-hidden="true" className="text-kumo-danger">
						*
					</span>
				</span>
			}
			id={field.name}
			name={field.name}
			type={type}
			autoComplete={autoComplete}
			required
			aria-required="true"
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={(e) => field.handleChange(e.target.value)}
			error={field.state.meta.errors[0]?.message}
		/>
	);
}
