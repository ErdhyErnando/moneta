import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

export function AssetForm({ onSubmit, defaultValues }: AssetFormProps) {
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
			<div>
				<form.Field name="type">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Type</Label>
							<Select
								value={field.state.value}
								onValueChange={(val) => field.handleChange(val as AssetType)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{ASSET_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{ASSET_TYPE_LABELS[type]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>
			</div>

			<div>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Name</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="e.g. BBCA, BTC, Cash BCA"
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
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<form.Field name="symbol">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Symbol</Label>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Optional"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>
				<div>
					<form.Field name="quantity">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Quantity</Label>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									step="any"
									placeholder="Optional"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<form.Field name="amount">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Amount / Value</Label>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									step="0.01"
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
						)}
					</form.Field>
				</div>
				<div>
					<form.Field name="date">
						{(field) => (
							<DateInput
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
			</div>

			<div>
				<form.Field name="notes">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Notes</Label>
							<Input
								id={field.name}
								name={field.name}
								placeholder="Optional"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<form.Subscribe>
				{(state) => (
					<Button
						type="submit"
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
