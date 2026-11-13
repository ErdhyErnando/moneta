import { Input } from "@cloudflare/kumo";
import type { AnyFieldApi } from "@tanstack/react-form";

type AuthFieldProps = {
	field: AnyFieldApi;
	label: string;
	type?: string;
	autoComplete?: string;
};

// Shared text field (label + input + validation errors) for the sign-in and
// sign-up forms (#49). Callers keep their own <form.Field> wrapper so the
// field name stays fully typed at each call site.
export function AuthField({
	field,
	label,
	type,
	autoComplete,
}: AuthFieldProps): React.JSX.Element {
	return (
		<Input
			label={label}
			id={field.name}
			name={field.name}
			type={type}
			autoComplete={autoComplete}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={(e) => field.handleChange(e.target.value)}
			error={field.state.meta.errors[0]?.message}
		/>
	);
}
