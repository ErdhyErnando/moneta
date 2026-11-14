import { Button, Input, Select } from "@cloudflare/kumo";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DateField } from "@/components/date-picker";
import { api } from "@/lib/api";

const startingBalanceSchema = z.object({
	amount: z
		.string()
		.min(1, "Amount is required")
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format (max 2 decimal places)"),
	description: z.string().optional(),
	date: z.date(),
	categoryId: z.number().min(1, "Category is required"),
});

type Category = {
	id: number;
	name: string;
	type: "starting_balance";
};

type StartingBalanceFormProps = {
	onSubmit: (data: z.infer<typeof startingBalanceSchema>) => Promise<void>;
	defaultValues?: Partial<z.infer<typeof startingBalanceSchema>>;
};

export default function StartingBalanceForm({
	onSubmit,
	defaultValues,
}: StartingBalanceFormProps) {
	const {
		data: categories,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["categories", "starting_balance"],
		queryFn: async () => {
			try {
				const res = await api.get<{ categories: Category[] }>(
					"/api/categories",
				);
				const filtered = res.data.categories.filter(
					(c) => c.type === "starting_balance",
				);
				return filtered;
			} catch (err) {
				console.error("Error fetching categories:", err);
				throw err;
			}
		},
	});

	const form = useForm({
		defaultValues: {
			amount: defaultValues?.amount || "",
			description: defaultValues?.description || "",
			date: defaultValues?.date || new Date(),
			categoryId: defaultValues?.categoryId || 0,
		},
		onSubmit: async ({ value }) => {
			const result = startingBalanceSchema.safeParse(value);
			if (!result.success) {
				console.error("Validation error:", result.error);
				return;
			}
			await onSubmit(result.data);
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

			<form.Field name="amount">
				{(field) => (
					<Input
						label="Amount"
						id={field.name}
						name={field.name}
						type="number"
						step="0.01"
						inputMode="decimal"
						className="text-right tabular-nums"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
					/>
				)}
			</form.Field>

			<form.Field name="categoryId">
				{(field) =>
					error ? (
						<div className="rounded-lg border border-kumo-danger bg-kumo-danger-tint p-3 text-kumo-danger text-sm">
							Failed to load categories. Please try again.
						</div>
					) : (
						<Select
							label="Category"
							id={field.name}
							className="w-full"
							placeholder={
								isLoading
									? "Loading categories..."
									: categories?.length === 0
										? "No categories available"
										: "Select category"
							}
							value={field.state.value ? field.state.value : null}
							onValueChange={(val) => field.handleChange(Number(val))}
							disabled={isLoading || !categories || categories.length === 0}
							items={(categories ?? []).map((category) => ({
								label: category.name,
								value: category.id,
							}))}
						/>
					)
				}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<Input
						label="Description"
						id={field.name}
						name={field.name}
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
						{state.isSubmitting ? "Saving..." : "Save Starting Balance"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
