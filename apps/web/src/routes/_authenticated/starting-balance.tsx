import { IconPlus, IconWallet } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import StartingBalanceForm from "@/components/starting-balance-form";
import {
	type StartingBalance,
	StartingBalanceList,
} from "@/components/starting-balance-list";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

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
			await api.post("/api/starting-balances", data);
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
			await api.put(`/api/starting-balances/${id}`, data);
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
					<div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
						<IconWallet className="size-6 text-blue-600 dark:text-blue-400" />
					</div>
					<h1 className="font-bold text-3xl">Starting Balance</h1>
				</div>
				<Dialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						if (!open) setEditingBalance(null);
					}}
				>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingBalance(null)}>
							<IconPlus className="mr-2 size-4" />
							Add Balance
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingBalance
									? "Edit Starting Balance"
									: "Add Starting Balance"}
							</DialogTitle>
						</DialogHeader>
						<StartingBalanceForm
							defaultValues={
								editingBalance
									? {
											amount: editingBalance.amount,
											description: editingBalance.description,
											date: new Date(editingBalance.date),
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
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
				<div className="p-6">
					{isLoading ? (
						<div className="space-y-2">
							<div className="h-12 w-full animate-pulse rounded bg-muted" />
							<div className="h-12 w-full animate-pulse rounded bg-muted" />
							<div className="h-12 w-full animate-pulse rounded bg-muted" />
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
							onDelete={(balance) => {
								if (
									confirm(
										"Are you sure you want to delete this starting balance?",
									)
								) {
									deleteMutation.mutate(balance.id);
								}
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
