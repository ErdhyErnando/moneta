import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TransactionForm from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/expense")({
	component: ExpensePage,
});

type Expense = {
	id: number;
	amount: string;
	description: string;
	date: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
		type: "income" | "expense";
	};
};

type TransactionFormData = {
	amount: string;
	description?: string;
	date: Date;
	categoryId: number;
};

function ExpensePage() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const queryClient = useQueryClient();

	const { data: expenses, isLoading } = useQuery({
		queryKey: ["expenses"],
		queryFn: async () => {
			const res = await api.get<{ expenses: Expense[] }>("/api/expenses");
			return res.data.expenses;
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: TransactionFormData) => {
			await api.post("/api/expenses", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			setIsOpen(false);
			toast.success("Expense added successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to add expense",
			);
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: TransactionFormData;
		}) => {
			await api.put(`/api/expenses/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			setIsOpen(false);
			setEditingId(null);
			toast.success("Expense updated successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to update expense",
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/expenses/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			toast.success("Expense deleted successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to delete expense",
			);
		},
	});

	const handleSubmit = async (data: TransactionFormData) => {
		if (editingId) {
			await updateMutation.mutateAsync({ id: editingId, data });
		} else {
			await createMutation.mutateAsync(data);
		}
	};

	const handleEdit = (expense: Expense) => {
		setEditingId(expense.id);
		setIsOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure you want to delete this expense?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Expenses</h1>
				<Dialog
					open={isOpen}
					onOpenChange={(open) => {
						setIsOpen(open);
						if (!open) setEditingId(null);
					}}
				>
					<DialogTrigger asChild>
						<Button variant="destructive">
							<Plus className="mr-2 h-4 w-4" /> Add Expense
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingId ? "Edit Expense" : "Add Expense"}
							</DialogTitle>
						</DialogHeader>
						<TransactionForm
							type="expense"
							onSubmit={handleSubmit}
							defaultValues={
								editingId
									? expenses?.find((e) => e.id === editingId)
										? {
												amount: expenses.find((e) => e.id === editingId)
													?.amount,
												description: expenses.find((e) => e.id === editingId)
													?.description,
												date: new Date(
													expenses.find((e) => e.id === editingId)?.date || "",
												),
												categoryId: expenses.find((e) => e.id === editingId)
													?.categoryId,
											}
										: undefined
									: undefined
							}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : expenses?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No expenses found.
								</TableCell>
							</TableRow>
						) : (
							expenses?.map((expense) => (
								<TableRow key={expense.id}>
									<TableCell>
										{format(new Date(expense.date), "MMM d, yyyy")}
									</TableCell>
									<TableCell>{expense.category.name}</TableCell>
									<TableCell>{expense.description}</TableCell>
									<TableCell className="text-right font-medium text-red-600">
										-${Number(expense.amount).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEdit(expense)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(expense.id)}
										>
											<Trash className="h-4 w-4 text-red-500" />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
