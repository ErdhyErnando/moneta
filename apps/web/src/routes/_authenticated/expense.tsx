import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { format } from "date-fns";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelector } from "@/components/currency-selector";
import TransactionForm from "@/components/transaction-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { useCurrency } from "@/contexts/currency-context";
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
	const { formatCurrency } = useCurrency();
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
			toast({
				title: "Success",
				description: "Expense added successfully",
			});
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to add expense",
				variant: "destructive",
			});
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
			toast({
				title: "Success",
				description: "Expense updated successfully",
			});
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to update expense",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/expenses/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			toast({
				title: "Success",
				description: "Expense deleted successfully",
			});
			setIsDeleteOpen(false);
			setDeleteId(null);
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to delete expense",
				variant: "destructive",
			});
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

	const handleDelete = (id: number) => {
		setDeleteId(id);
		setIsDeleteOpen(true);
	};

	const confirmDelete = async () => {
		if (deleteId) {
			await deleteMutation.mutateAsync(deleteId);
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Expenses</h1>
				<div className="flex items-center gap-2">
					<CurrencySelector />
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
							{(() => {
								const editingExpense = editingId
									? expenses?.find((e) => e.id === editingId)
									: undefined;
								return (
									<TransactionForm
										type="expense"
										onSubmit={handleSubmit}
										defaultValues={
											editingExpense
												? {
													amount: editingExpense.amount,
													description: editingExpense.description,
													date: new Date(editingExpense.date),
													categoryId: editingExpense.categoryId,
												}
												: undefined
										}
									/>
								);
							})()}
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Expense</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this expense? This action cannot
							be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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
										-{formatCurrency(Number(expense.amount))}
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
