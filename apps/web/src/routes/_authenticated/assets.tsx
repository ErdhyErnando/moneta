import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import {
	AssetForm,
	type AssetFormValues,
} from "@/components/assets/asset-form";
import { AssetsGroup } from "@/components/assets/assets-group";
import { CurrencySelector } from "@/components/currency-selector";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrency } from "@/contexts/currency-context";
import { useToast } from "@/hooks/use-toast";
import { type AxiosError, api } from "@/lib/api";
import {
	ASSET_TYPE_LABELS,
	ASSET_TYPES,
	type Asset,
	type AssetType,
} from "@/lib/assets";
import { asUtcDay, toUtcDayIso } from "@/lib/date";

const AssetsChart = lazy(() =>
	import("@/components/assets/assets-chart").then((m) => ({
		default: m.AssetsChart,
	})),
);

export const Route = createFileRoute("/_authenticated/assets")({
	component: AssetsPage,
});

type AssetGroup = {
	type: AssetType;
	assets: Asset[];
	total: number;
};

function AssetsPage() {
	const { toast } = useToast();
	const { formatCurrency } = useCurrency();
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const deleteIdRef = useRef<number | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const queryClient = useQueryClient();

	const { data: assets = [], isLoading } = useQuery({
		queryKey: ["assets"],
		queryFn: async () => {
			const res = await api.get<{ assets: Asset[] }>("/api/assets");
			return res.data.assets;
		},
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["assets"] });

	const createMutation = useMutation({
		mutationFn: async (data: AssetFormValues) => {
			await api.post("/api/assets", {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			invalidate();
			setIsOpen(false);
			toast({ title: "Success", description: "Asset added successfully" });
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to add asset",
				variant: "destructive",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({ id, data }: { id: number; data: AssetFormValues }) => {
			await api.put(`/api/assets/${id}`, {
				...data,
				date: toUtcDayIso(data.date),
			});
		},
		onSuccess: () => {
			invalidate();
			setIsOpen(false);
			setEditingId(null);
			toast({ title: "Success", description: "Asset updated successfully" });
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to update asset",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/assets/${id}`);
		},
		onSuccess: () => {
			invalidate();
			setIsDeleteOpen(false);
			deleteIdRef.current = null;
			toast({ title: "Success", description: "Asset deleted successfully" });
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to delete asset",
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (data: AssetFormValues) => {
		if (editingId) {
			await updateMutation.mutateAsync({ id: editingId, data });
		} else {
			await createMutation.mutateAsync(data);
		}
	};

	const handleEdit = (asset: Asset) => {
		setEditingId(asset.id);
		setIsOpen(true);
	};

	const handleDelete = (asset: Asset) => {
		deleteIdRef.current = asset.id;
		setIsDeleteOpen(true);
	};

	const confirmDelete = async () => {
		const id = deleteIdRef.current;
		if (id) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const groups = useMemo<AssetGroup[]>(() => {
		const byType = new Map<AssetType, Asset[]>();
		for (const asset of assets) {
			const list = byType.get(asset.type) ?? [];
			list.push(asset);
			byType.set(asset.type, list);
		}
		return ASSET_TYPES.flatMap((type) => {
			const list = byType.get(type) ?? [];
			if (list.length === 0) {
				return [];
			}
			return [
				{
					type,
					assets: list,
					total: list.reduce((sum, a) => sum + Number(a.amount), 0),
				},
			];
		});
	}, [assets]);

	const totalValue = useMemo(
		() => assets.reduce((sum, a) => sum + Number(a.amount), 0),
		[assets],
	);

	const editingAsset = editingId
		? assets.find((a) => a.id === editingId)
		: undefined;

	return (
		<div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl sm:text-3xl">Assets</h1>
					<p className="text-muted-foreground text-sm">
						Holdings ledger — stocks, bonds, cash, crypto and more
					</p>
				</div>
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
							<Button>
								<Plus className="mr-2 h-4 w-4" /> Add Asset
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{editingId ? "Edit Asset" : "Add Asset"}
								</DialogTitle>
							</DialogHeader>
							<AssetForm
								onSubmit={handleSubmit}
								defaultValues={
									editingAsset
										? {
												type: editingAsset.type,
												name: editingAsset.name,
												symbol: editingAsset.symbol ?? "",
												quantity: editingAsset.quantity ?? "",
												amount: editingAsset.amount,
												date: asUtcDay(editingAsset.date),
												notes: editingAsset.notes ?? "",
											}
										: undefined
								}
							/>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-[300px] items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			) : (
				<div className="space-y-6">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Total Assets</CardDescription>
								<CardTitle className="text-2xl">
									{formatCurrency(totalValue)}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-xs">
									{assets.length} holding{assets.length === 1 ? "" : "s"}
								</p>
							</CardContent>
						</Card>
						{groups.map((group) => (
							<Card key={group.type}>
								<CardHeader className="pb-2">
									<CardDescription>
										{ASSET_TYPE_LABELS[group.type]}
									</CardDescription>
									<CardTitle className="text-2xl">
										{formatCurrency(group.total)}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-xs">
										{group.assets.length} holding
										{group.assets.length === 1 ? "" : "s"}
									</p>
								</CardContent>
							</Card>
						))}
					</div>

					<Suspense
						fallback={
							<div className="flex h-[200px] items-center justify-center">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
							</div>
						}
					>
						<AssetsChart />
					</Suspense>

					{groups.length === 0 ? (
						<Card>
							<CardContent className="py-16 text-center">
								<p className="text-muted-foreground">
									No assets yet. Add your first holding to start tracking.
								</p>
							</CardContent>
						</Card>
					) : (
						groups.map((group) => (
							<AssetsGroup
								key={group.type}
								type={group.type}
								assets={group.assets}
								total={group.total}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))
					)}
				</div>
			)}

			<DeleteConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Delete Asset"
				description="Are you sure you want to delete this asset? This action cannot be undone."
				onConfirm={confirmDelete}
				pending={deleteMutation.isPending}
			/>
		</div>
	);
}
