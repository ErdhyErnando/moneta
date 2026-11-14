import { Button, buttonVariants } from "@cloudflare/kumo";
import { ChartBarIcon, PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CurrencySelector } from "@/components/currency-selector";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { PageContainer, PageHeader } from "@/components/layout";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import TransactionForm from "@/components/transaction-form";
import {
	type Transaction,
	TransactionTable,
} from "@/components/transaction-table";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "@/lib/api";
import { api } from "@/lib/api";
import { asUtcDay, toUtcDayIso } from "@/lib/date";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/income")({
	component: IncomePage,
});

type TransactionFormData = {
	amount: string;
	description?: string;
	date: Date;
	categoryId: number;
};

function IncomePage(): React.JSX.Element {
	const { toast } = useToast();
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const deleteIdRef = useRef<number | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const queryClient = useQueryClient();

	const {
		data: incomes = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["incomes"],
		queryFn: async () => {
			const res = await api.get<{ incomes: Transaction[] }>("/api/incomes");
			return res.data.incomes;
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: TransactionFormData) => {
			await api.post("/api/incomes", {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			setIsOpen(false);
			toast({
				title: "Success",
				description: "Income added successfully",
			});
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to add income",
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
			await api.put(`/api/incomes/${id}`, {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			setIsOpen(false);
			setEditingId(null);
			toast({
				title: "Success",
				description: "Income updated successfully",
			});
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to update income",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/incomes/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["incomes"] });
			toast({
				title: "Success",
				description: "Income deleted successfully",
			});
			setIsDeleteOpen(false);
			deleteIdRef.current = null;
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to delete income",
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

	const handleEdit = (transaction: Transaction) => {
		setEditingId(transaction.id);
		setIsOpen(true);
	};

	const handleDelete = (transaction: Transaction) => {
		deleteIdRef.current = transaction.id;
		setIsDeleteOpen(true);
	};

	const confirmDelete = async () => {
		const id = deleteIdRef.current;
		if (id) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const editingIncome = editingId
		? incomes.find((i) => i.id === editingId)
		: undefined;

	return (
		<PageContainer>
			<PageHeader
				title="Income"
				description="Every income, grouped by month."
				actions={
					<>
						<Link
							to="/income/breakdown"
							className={cn(
								buttonVariants({ variant: "secondary" }),
								"max-md:h-11",
							)}
						>
							<ChartBarIcon className="mr-2" size={16} /> Breakdown
						</Link>
						<CurrencySelector />
						<Button
							variant="primary"
							icon={<PlusIcon size={16} />}
							onClick={() => setIsOpen(true)}
							className="max-md:hidden"
						>
							Add Income
						</Button>
					</>
				}
			/>

			<ResponsiveDialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) setEditingId(null);
				}}
				title={editingId ? "Edit Income" : "Add Income"}
			>
				<TransactionForm
					type="income"
					onSubmit={handleSubmit}
					defaultValues={
						editingIncome
							? {
									amount: editingIncome.amount,
									description: editingIncome.description,
									date: asUtcDay(editingIncome.date),
									categoryId: editingIncome.categoryId,
								}
							: undefined
					}
				/>
			</ResponsiveDialog>

			<DeleteConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Delete this income?"
				description="It is removed from your ledger and cannot be recovered."
				onConfirm={confirmDelete}
				pending={deleteMutation.isPending}
			/>

			<TransactionTable
				data={incomes}
				type="income"
				isLoading={isLoading}
				isError={isError}
				onRetry={() => {
					void refetch();
				}}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</PageContainer>
	);
}
