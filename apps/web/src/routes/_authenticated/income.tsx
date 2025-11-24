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

export const Route = createFileRoute("/_authenticated/income")({
	component: IncomePage,
});

type Income = {
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

function IncomePage() {
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const queryClient = useQueryClient();

	const { data: incomes, isLoading } = useQuery({
		queryKey: ["incomes"],
		queryFn: async () => {
			const res = await api.get<{ incomes: Income[] }>("/api/incomes");
			return res.data.incomes;
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: TransactionFormData) => {
			await api.post("/api/incomes", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			setIsOpen(false);
			toast.success("Income added successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to add income",
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
			await api.put(`/api/incomes/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			setIsOpen(false);
			setEditingId(null);
			toast.success("Income updated successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to update income",
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/incomes/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			toast.success("Income deleted successfully");
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast.error(
				error.response?.data?.error?.message || "Failed to delete income",
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

	const handleEdit = (income: Income) => {
		setEditingId(income.id);
		setIsOpen(true);
	};

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure you want to delete this income?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Income</h1>
				<Dialog
					open={isOpen}
					onOpenChange={(open) => {
						setIsOpen(open);
						if (!open) setEditingId(null);
					}}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" /> Add Income
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingId ? "Edit Income" : "Add Income"}
							</DialogTitle>
						</DialogHeader>
						<TransactionForm
							type="income"
							onSubmit={handleSubmit}
							defaultValues={
								editingId
									? incomes?.find((i) => i.id === editingId)
										? {
												amount: incomes.find((i) => i.id === editingId)?.amount,
												description: incomes.find((i) => i.id === editingId)
													?.description,
												date: new Date(
													incomes.find((i) => i.id === editingId)?.date || "",
												),
												categoryId: incomes.find((i) => i.id === editingId)
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
						) : incomes?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No incomes found.
								</TableCell>
							</TableRow>
						) : (
							incomes?.map((income) => (
								<TableRow key={income.id}>
									<TableCell>
										{format(new Date(income.date), "MMM d, yyyy")}
									</TableCell>
									<TableCell>{income.category.name}</TableCell>
									<TableCell>{income.description}</TableCell>
									<TableCell className="text-right font-medium text-green-600">
										+${Number(income.amount).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEdit(income)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDelete(income.id)}
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
