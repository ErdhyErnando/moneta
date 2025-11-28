import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const startingBalanceSchema = z.object({
	amount: z.string().min(1, "Amount is required"),
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
			<div>
				<form.Field name="amount">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Amount</Label>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								step="0.01"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<div>
				<form.Field name="categoryId">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Category</Label>
							{error ? (
								<div className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
									Failed to load categories. Please try again.
								</div>
							) : (
								<Select
									value={
										field.state.value ? String(field.state.value) : undefined
									}
									onValueChange={(val) => field.handleChange(Number(val))}
									disabled={isLoading || !categories || categories.length === 0}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												isLoading
													? "Loading categories..."
													: categories?.length === 0
														? "No categories available"
														: "Select category"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{categories?.map((category) => (
											<SelectItem key={category.id} value={String(category.id)}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					)}
				</form.Field>
			</div>

			<div>
				<form.Field name="description">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Description</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<div>
				<form.Field name="date">
					{(field) => (
						<div className="flex flex-col space-y-2">
							<Label htmlFor={field.name}>Date</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full pl-3 text-left font-normal",
											!field.state.value && "text-muted-foreground",
										)}
									>
										{field.state.value ? (
											format(field.state.value, "PPP")
										) : (
											<span>Pick a date</span>
										)}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.state.value}
										onSelect={(date) => date && field.handleChange(date)}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
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
						{state.isSubmitting ? "Saving..." : "Save Starting Balance"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
