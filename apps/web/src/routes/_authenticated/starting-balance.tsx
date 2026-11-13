import { Button } from "@cloudflare/kumo";
import { PlusIcon, WalletIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import StartingBalanceForm from "@/components/starting-balance-form";
import {
	type StartingBalance,
	StartingBalanceList,
} from "@/components/starting-balance-list";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { asUtcDay, toUtcDayIso } from "@/lib/date";

type StartingBalanceFormData = {
	amount: string;
	description?: string;
	date: Date;
	categoryId: number;
};

export const Route = createFileRoute("/_authenticated/starting-balance")({
	component: StartingBalancePage,
});

function StartingBalancePage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingBalance, setEditingBalance] = useState<StartingBalance | null>(
		null,
	);
	const [deletingBalance, setDeletingBalance] =
		useState<StartingBalance | null>(null);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { data: startingBalances = [], isLoading } = useQuery({
		queryKey: ["starting-balances"],
		queryFn: async () => {
			const res = await api.get<{ startingBalances: StartingBalance[] }>(
				"/api/starting-balances",
			);
			return res.data.startingBalances;
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: StartingBalanceFormData) => {
			await api.post("/api/starting-balances", {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["starting-balances"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
			setIsDialogOpen(false);
			toast({
				title: "Success",
				description: "Starting balance added successfully",
			});
		},
		onError: (error) => {
			console.error("Failed to add starting balance:", error);
			toast({
				title: "Error",
				description: "Failed to add starting balance",
				variant: "destructive",
			});
		},
	});

	const editMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: StartingBalanceFormData;
		}) => {
			await api.put(`/api/starting-balances/${id}`, {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["starting-balances"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
			setIsDialogOpen(false);
			setEditingBalance(null);
			toast({
				title: "Success",
				description: "Starting balance updated successfully",
			});
		},
		onError: (error) => {
			console.error("Failed to update starting balance:", error);
			toast({
				title: "Error",
				description: "Failed to update starting balance",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/starting-balances/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["starting-balances"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
			toast({
				title: "Success",
				description: "Starting balance deleted successfully",
			});
		},
		onError: (error) => {
			console.error("Failed to delete starting balance:", error);
			toast({
				title: "Error",
				description: "Failed to delete starting balance",
				variant: "destructive",
			});
		},
	});

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="rounded-lg bg-kumo-tint p-2">
						<WalletIcon className="text-kumo-strong" size={20} />
					</div>
					<h1 className="font-bold text-3xl">Starting Balance</h1>
				</div>
				<Button
					variant="primary"
					icon={<PlusIcon size={16} />}
					onClick={() => {
						setEditingBalance(null);
						setIsDialogOpen(true);
					}}
				>
					Add Balance
				</Button>
				<ResponsiveDialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						if (!open) setEditingBalance(null);
					}}
					title={
						editingBalance ? "Edit Starting Balance" : "Add Starting Balance"
					}
				>
					<StartingBalanceForm
						defaultValues={
							editingBalance
								? {
										amount: editingBalance.amount,
										description: editingBalance.description,
										date: asUtcDay(editingBalance.date),
										categoryId: editingBalance.categoryId,
									}
								: undefined
						}
						onSubmit={async (data) => {
							if (editingBalance) {
								await editMutation.mutateAsync({
									id: editingBalance.id,
									data,
								});
							} else {
								await createMutation.mutateAsync(data);
							}
						}}
					/>
				</ResponsiveDialog>
			</div>

			<div className="rounded-xl border border-kumo-hairline bg-kumo-base">
				<div className="p-6">
					{isLoading ? (
						<div className="space-y-2">
							<div className="h-12 w-full animate-pulse rounded-lg bg-kumo-fill" />
							<div className="h-12 w-full animate-pulse rounded-lg bg-kumo-fill" />
							<div className="h-12 w-full animate-pulse rounded-lg bg-kumo-fill" />
						</div>
					) : (
						<StartingBalanceList
							data={startingBalances}
							onAddClick={() => {
								setEditingBalance(null);
								setIsDialogOpen(true);
							}}
							onEdit={(balance) => {
								setEditingBalance(balance);
								setIsDialogOpen(true);
							}}
							onDelete={setDeletingBalance}
						/>
					)}
				</div>
			</div>

			<DeleteConfirmDialog
				open={deletingBalance !== null}
				onOpenChange={(open) => {
					if (!open) setDeletingBalance(null);
				}}
				title="Delete Starting Balance"
				description="This entry will be removed from your balance history. This action cannot be undone."
				onConfirm={() => {
					if (deletingBalance) {
						deleteMutation.mutate(deletingBalance.id);
						setDeletingBalance(null);
					}
				}}
				pending={deleteMutation.isPending}
			/>
		</div>
	);
}
