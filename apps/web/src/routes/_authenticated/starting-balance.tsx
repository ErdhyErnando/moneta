import { Banner, Button, LayerCard } from "@cloudflare/kumo";
import {
	ArrowClockwiseIcon,
	PlusIcon,
	WalletIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
	EmptyState,
	PageContainer,
	PageHeader,
	Section,
} from "@/components/layout";
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

function StartingBalancePage(): React.JSX.Element {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingBalance, setEditingBalance] = useState<StartingBalance | null>(
		null,
	);
	const [deletingBalance, setDeletingBalance] =
		useState<StartingBalance | null>(null);
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const {
		data: startingBalances = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
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

	const openCreate = () => {
		setEditingBalance(null);
		setIsDialogOpen(true);
	};

	const showEmpty = !isLoading && !isError && startingBalances.length === 0;

	return (
		<PageContainer>
			<PageHeader
				title="Starting balance"
				description="What each account held before you started recording."
				className="max-md:mb-4"
				actions={
					<Button
						variant="primary"
						icon={<PlusIcon size={16} />}
						onClick={openCreate}
						className="max-md:hidden"
					>
						Add starting balance
					</Button>
				}
			/>

			{/* Below md the bottom-nav "+" is the add-transaction flow, so this page
			    keeps its own CTA — full width at the top of the content. Skipped
			    when the empty state is on screen, since that carries the action. */}
			{showEmpty ? null : (
				<Button
					variant="primary"
					icon={<PlusIcon size={16} />}
					onClick={openCreate}
					className="mb-6 w-full md:hidden"
				>
					Add starting balance
				</Button>
			)}

			<Section title="Balances">
				{isError ? (
					<Banner
						variant="error"
						icon={<WarningCircleIcon size={16} />}
						title="Could not load your starting balances"
						description="The balance history did not load."
						action={
							<Banner.Action
								variant="secondary"
								icon={<ArrowClockwiseIcon size={16} />}
								onClick={() => refetch()}
							>
								Retry
							</Banner.Action>
						}
					/>
				) : isLoading ? (
					<div className="space-y-2 rounded-xl border border-kumo-hairline bg-kumo-base p-4">
						{[0, 1, 2].map((row) => (
							<div
								key={row}
								className="h-10 w-full animate-pulse rounded bg-kumo-fill"
							/>
						))}
					</div>
				) : showEmpty ? (
					<LayerCard className="rounded-xl p-6 shadow-none">
						<EmptyState
							icon={<WalletIcon size={20} />}
							size="base"
							title="No starting balances yet"
							description="Add what you had on hand before your first transaction."
							action={
								<Button
									variant="secondary"
									icon={<PlusIcon size={16} />}
									onClick={openCreate}
								>
									Add starting balance
								</Button>
							}
						/>
					</LayerCard>
				) : (
					<StartingBalanceList
						data={startingBalances}
						onEdit={(balance) => {
							setEditingBalance(balance);
							setIsDialogOpen(true);
						}}
						onDelete={setDeletingBalance}
					/>
				)}
			</Section>

			<ResponsiveDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setEditingBalance(null);
				}}
				title={
					editingBalance ? "Edit starting balance" : "Add starting balance"
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

			<DeleteConfirmDialog
				open={deletingBalance !== null}
				onOpenChange={(open) => {
					if (!open) setDeletingBalance(null);
				}}
				title="Delete this starting balance?"
				description="It is removed from your balance history and cannot be recovered."
				onConfirm={() => {
					if (deletingBalance) {
						deleteMutation.mutate(deletingBalance.id);
						setDeletingBalance(null);
					}
				}}
				pending={deleteMutation.isPending}
			/>
		</PageContainer>
	);
}
