import { Button, Input, Select } from "@cloudflare/kumo";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { DateField } from "@/components/date-picker";
import { ASSET_TYPE_LABELS, ASSET_TYPES, type AssetType } from "@/lib/assets";

const assetFormSchema = z.object({
	type: z.enum(ASSET_TYPES),
	name: z.string().trim().min(1, "Name is required").max(120),
	symbol: z.string().trim().max(20),
	quantity: z.string(),
	amount: z.string().min(1, "Amount is required"),
	date: z.date(),
	notes: z.string().trim().max(280),
});

export type AssetFormValues = {
	type: AssetType;
	name: string;
	symbol?: string;
	quantity?: string;
	amount: string;
	date: Date;
	notes?: string;
};

type AssetFormProps = {
	onSubmit: (data: AssetFormValues) => Promise<void>;
	defaultValues?: Partial<AssetFormValues>;
};

export function AssetForm({
	onSubmit,
	defaultValues,
}: AssetFormProps): React.JSX.Element {
	const form = useForm({
		defaultValues: {
			type: defaultValues?.type ?? "cash",
			name: defaultValues?.name ?? "",
			symbol: defaultValues?.symbol ?? "",
			quantity: defaultValues?.quantity ?? "",
			amount: defaultValues?.amount ?? "",
			date: defaultValues?.date ?? new Date(),
			notes: defaultValues?.notes ?? "",
		},
		validators: {
			onSubmit: assetFormSchema,
		},
		onSubmit: async ({ value }) => {
			const result = assetFormSchema.safeParse(value);
			if (!result.success) return;
			// Send undefined for empty optional fields so the server schema accepts them
			await onSubmit({
				...result.data,
				symbol: result.data.symbol || undefined,
				quantity: result.data.quantity || undefined,
				notes: result.data.notes || undefined,
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="type">
				{(field) => (
					<Select
						label="Type"
						id={field.name}
						className="w-full"
						placeholder="Select type"
						value={field.state.value}
						onValueChange={(value) => {
							if (value) field.handleChange(value as AssetType);
						}}
						items={ASSET_TYPES.map((type) => ({
							label: ASSET_TYPE_LABELS[type],
							value: type,
						}))}
					/>
				)}
			</form.Field>

			<form.Field name="name">
				{(field) => (
					<Input
						label="Name"
						id={field.name}
						name={field.name}
						placeholder="e.g. BBCA, BTC, Cash BCA"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="symbol">
					{(field) => (
						<Input
							label="Symbol"
							id={field.name}
							name={field.name}
							placeholder="Optional"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>
				<form.Field name="quantity">
					{(field) => (
						<Input
							label="Quantity"
							id={field.name}
							name={field.name}
							type="number"
							step="any"
							placeholder="Optional"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="amount">
					{(field) => (
						<Input
							label="Amount / Value"
							id={field.name}
							name={field.name}
							type="number"
							step="0.01"
							inputMode="decimal"
							className="text-right tabular-nums"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							error={field.state.meta.errors[0]?.message}
						/>
					)}
				</form.Field>
				<form.Field name="date">
					{(field) => (
						<DateField
							id={field.name}
							label="Date"
							value={field.state.value}
							onChange={(date) => field.handleChange(date)}
							disabled={(date) =>
								date > new Date() || date < new Date("1900-01-01")
							}
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="notes">
				{(field) => (
					<Input
						label="Notes"
						id={field.name}
						name={field.name}
						placeholder="Optional"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
					/>
				)}
			</form.Field>

			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
						variant="primary"
						className="w-full"
						disabled={!state.canSubmit || state.isSubmitting}
					>
						{state.isSubmitting ? "Saving..." : "Save Asset"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
