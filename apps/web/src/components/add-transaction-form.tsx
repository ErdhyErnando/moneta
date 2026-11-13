import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { type AxiosError, api } from "@/lib/api";
import { toUtcDayIso } from "@/lib/date";

const transactionSchema = z.object({
	amount: z
		.string()
		.trim()
		.min(1, "Amount is required")
		.regex(/^\d+(\.\d{1,2})?$/, "Amount must be a positive number")
		.refine((v) => Number(v) > 0, "Amount must be positive"),
	description: z.string().trim().max(280).optional(),
	date: z.date(),
	categoryId: z.number().int().positive("Category is required"),
});

type Category = {
	id: number;
	name: string;
	type: "income" | "expense" | "starting_balance";
};

export type AddTransactionType = "expense" | "income";

type AddTransactionFormProps = {
	type: AddTransactionType;
	onTypeChange: (type: AddTransactionType) => void;
	/** Called after a successful save (e.g. to close the hosting dialog). */
	onSuccess?: () => void;
};

/**
 * The add-transaction flow, extracted so it can render in the dashboard's
 * dialog (Phase 2) and later inside `ResponsiveDialog` on mobile (Phase 4).
 * Behaviour is unchanged from the original `AddTransactionDialog` body.
 */
export function AddTransactionForm({
	type,
	onTypeChange,
	onSuccess,
}: AddTransactionFormProps): React.JSX.Element {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState<Date>(new Date());
	const [categoryId, setCategoryId] = useState<number>(0);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories", type],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
			return res.data.categories.filter((c) => c.type === type);
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof transactionSchema>) => {
			const endpoint = type === "expense" ? "/api/expenses" : "/api/incomes";
			await api.post(endpoint, {
				...data,
				amount: data.amount,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-transactions"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-chart"] });
			queryClient.invalidateQueries({ queryKey: ["monthly-expenses"] });
			queryClient.invalidateQueries({ queryKey: ["monthly-income"] });
			queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
			queryClient.invalidateQueries({ queryKey: ["income-categories"] });
			queryClient.invalidateQueries({ queryKey: ["mutations"] });
			toast({
				title: "Success",
				description: `${type === "expense" ? "Expense" : "Income"} added`,
			});
			setAmount("");
			setDescription("");
			setCategoryId(0);
			setDate(new Date());
			onSuccess?.();
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || `Failed to add ${type}`,
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const result = transactionSchema.safeParse({
			amount,
			description,
			date,
			categoryId,
		});
		if (!result.success) {
			toast({
				title: "Validation error",
				description: result.error.issues[0]?.message || "Check fields",
				variant: "destructive",
			});
			return;
		}
		mutation.mutate(result.data);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="flex gap-2">
				<Button
					type="button"
					variant={type === "expense" ? "destructive" : "outline"}
					className="flex-1"
					onClick={() => onTypeChange("expense")}
				>
					Expense
				</Button>
				<Button
					type="button"
					variant={type === "income" ? "default" : "outline"}
					className="flex-1"
					onClick={() => onTypeChange("income")}
				>
					Income
				</Button>
			</div>
			<div className="space-y-2">
				<Label htmlFor="amount">Amount</Label>
				<Input
					id="amount"
					type="text"
					inputMode="decimal"
					placeholder="0.00"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					required
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="category">Category</Label>
				<Select
					value={categoryId ? String(categoryId) : undefined}
					onValueChange={(v) => setCategoryId(Number(v))}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select category" />
					</SelectTrigger>
					<SelectContent>
						{categories.map((c) => (
							<SelectItem key={c.id} value={String(c.id)}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-2">
				<Label htmlFor="date">Date</Label>
				<DateInput
					id="date"
					label=""
					value={date}
					onChange={setDate}
					disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description (optional)</Label>
				<Input
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					maxLength={280}
					placeholder="Note"
				/>
			</div>
			<Button type="submit" className="w-full" disabled={mutation.isPending}>
				{mutation.isPending ? "Saving..." : "Save"}
			</Button>
		</form>
	);
}
