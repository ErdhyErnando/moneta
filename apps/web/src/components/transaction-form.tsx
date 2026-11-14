import { Button, Input, Select } from "@cloudflare/kumo";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DateInput } from "@/components/ui/date-input";
import { api } from "@/lib/api";

const transactionSchema = z.object({
	amount: z.string().min(1, "Amount is required"),
	description: z.string().optional(),
	date: z.date(),
	categoryId: z.number().min(1, "Category is required"),
});

type Category = {
	id: number;
	name: string;
	type: "income" | "expense";
};

type TransactionFormProps = {
	type: "income" | "expense";
	onSubmit: (data: z.infer<typeof transactionSchema>) => Promise<void>;
	defaultValues?: Partial<z.infer<typeof transactionSchema>>;
};

export default function TransactionForm({
	type,
	onSubmit,
	defaultValues,
}: TransactionFormProps) {
	const { data: categories, isError: categoriesError } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
			return res.data.categories.filter((c) => c.type === type);
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
			const result = transactionSchema.safeParse(value);
			if (!result.success) {
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
				{(field) => (
					<div className="space-y-1">
						<Select
							label="Category"
							id={field.name}
							className="w-full"
							placeholder="Select category"
							value={field.state.value ? field.state.value : null}
							onValueChange={(val) => field.handleChange(Number(val))}
							items={(categories ?? []).map((category) => ({
								label: category.name,
								value: category.id,
							}))}
						/>
						{categoriesError ? (
							<p className="text-kumo-danger text-xs">
								Categories could not be loaded. Close this dialog and try again.
							</p>
						) : null}
					</div>
				)}
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
						loading={state.isSubmitting}
						disabled={!state.canSubmit || state.isSubmitting}
					>
						{state.isSubmitting ? "Saving…" : "Save Transaction"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
