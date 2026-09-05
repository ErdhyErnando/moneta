import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
}: AuthFieldProps) {
	return (
		<div className="space-y-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.errors.map((error) => (
				<p key={error?.message} className="text-red-500 text-sm">
					{error?.message}
				</p>
			))}
		</div>
	);
}
