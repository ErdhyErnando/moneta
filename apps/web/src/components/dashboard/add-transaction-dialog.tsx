"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { useToast } from "@/hooks/use-toast";
import { api, type AxiosError } from "@/lib/api";
import { Plus } from "lucide-react";

const transactionSchema = z.object({
	amount: z
		.string()
		.trim()
		.regex(/^\d+(\.\d{1,2})?$/, "amount must be a decimal with up to 2 decimals")
		.refine((v) => Number(v) > 0, "amount must be positive"),
	description: z.string().trim().max(280).optional(),
	date: z.date(),
	categoryId: z.number().int().positive("Category is required"),
});

type Category = {
	id: number;
	name: string;
	type: string;
};

export function AddTransactionDialog() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<"expense" | "income">("expense");
	const [amount, setAmount] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState<Date>(new Date());
	const [categoryId, setCategoryId] = useState<number>(0);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories", type],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>(
				"/api/categories",
			);
			return res.data.categories.filter((c) => c.type === type);
		},
		enabled: open,
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof transactionSchema>) => {
			const endpoint = type === "expense" ? "/api/expenses" : "/api/incomes";
			await api.post(endpoint, {
				...data,
				amount: data.amount,
				date: data.date.toISOString(),
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
			toast({ title: "Success", description: `${type === "expense" ? "Expense" : "Income"} added` });
			setOpen(false);
			setAmount("");
			setDescription("");
			setCategoryId(0);
			setDate(new Date());
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description: error.response?.data?.error?.message || `Failed to add ${type}`,
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = transactionSchema.safeParse({ amount, description, date, categoryId });
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Add Transaction
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add {type === "expense" ? "Expense" : "Income"}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex gap-2">
						<Button
							type="button"
							variant={type === "expense" ? "destructive" : "outline"}
							className="flex-1"
							onClick={() => setType("expense")}
						>
							Expense
						</Button>
						<Button
							type="button"
							variant={type === "income" ? "default" : "outline"}
							className="flex-1"
							onClick={() => setType("income")}
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
			</DialogContent>
		</Dialog>
	);
}
