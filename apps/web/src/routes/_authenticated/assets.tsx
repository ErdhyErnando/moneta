import { Banner, Button, LayerCard } from "@cloudflare/kumo";
import {
	ArrowClockwiseIcon,
	PackageIcon,
	PlusIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import {
	AssetForm,
	type AssetFormValues,
} from "@/components/assets/asset-form";
import { AssetsGroup } from "@/components/assets/assets-group";
import { CurrencySelector } from "@/components/currency-selector";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
	EmptyState,
	PageContainer,
	PageHeader,
	Section,
} from "@/components/layout";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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

const SKELETON_CARDS = [0, 1, 2, 3];

function AssetsSkeleton(): React.JSX.Element {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{SKELETON_CARDS.map((card) => (
					<div
						key={card}
						className="h-26 animate-pulse rounded-xl bg-kumo-fill"
					/>
				))}
			</div>
			<div className="h-85 animate-pulse rounded-xl bg-kumo-fill" />
			<div className="h-45 animate-pulse rounded-xl bg-kumo-fill" />
		</div>
	);
}

function AssetsPage(): React.JSX.Element {
	const { toast } = useToast();
	const { formatCurrency } = useCurrency();
	const [isOpen, setIsOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const deleteIdRef = useRef<number | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const queryClient = useQueryClient();

	const {
		data: assets = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
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

	const openCreate = () => {
		setEditingId(null);
		setIsOpen(true);
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

	const showEmpty = !isLoading && !isError && assets.length === 0;

	const dialog = (
		<ResponsiveDialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
				if (!open) setEditingId(null);
			}}
			title={editingId ? "Edit asset" : "Add asset"}
		>
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
		</ResponsiveDialog>
	);

	return (
		<PageContainer>
			<PageHeader
				title="Assets"
				description="Holdings ledger — stocks, bonds, cash, crypto and more."
				className="max-md:mb-4"
				actions={
					<>
						<CurrencySelector />
						<Button
							variant="primary"
							icon={<PlusIcon size={16} />}
							onClick={openCreate}
							className="max-md:hidden"
						>
							Add asset
						</Button>
					</>
				}
			/>

			{/* Below md the bottom-nav "+" is the add-transaction flow, so these
			    pages keep their own CTA — full width at the top of the content.
			    Skipped when the empty state is on screen, since that carries the
			    same action. */}
			{showEmpty ? null : (
				<Button
					variant="primary"
					icon={<PlusIcon size={16} />}
					onClick={openCreate}
					className="mb-6 w-full md:hidden"
				>
					Add asset
				</Button>
			)}

			{isError ? (
				<Banner
					variant="error"
					icon={<WarningCircleIcon size={16} />}
					title="Could not load your assets"
					description="The holdings ledger did not load."
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
				<AssetsSkeleton />
			) : showEmpty ? (
				<LayerCard className="rounded-xl p-6 shadow-none">
					<EmptyState
						icon={<PackageIcon size={20} />}
						size="base"
						title="No assets yet"
						description="Add your first holding and its value will be tracked here."
						action={
							<Button
								variant="secondary"
								icon={<PlusIcon size={16} />}
								onClick={openCreate}
							>
								Add asset
							</Button>
						}
					/>
				</LayerCard>
			) : (
				<div className="space-y-6">
					<Section title="Overview">
						<LayerCard className="gap-0 rounded-xl p-0 shadow-none">
							<div className="space-y-1 px-6 py-5">
								<div className="text-kumo-subtle text-sm">Total assets</div>
								<div className="font-semibold text-2xl tabular-nums">
									{formatCurrency(totalValue)}
								</div>
								<p className="text-kumo-subtle text-xs">
									{assets.length} holding{assets.length === 1 ? "" : "s"} across{" "}
									{groups.length} type{groups.length === 1 ? "" : "s"}
								</p>
							</div>
							<div className="grid gap-4 border-kumo-hairline border-t p-6 sm:grid-cols-2 lg:grid-cols-4">
								{groups.map((group) => (
									<div
										key={group.type}
										className="space-y-1 rounded-lg bg-kumo-recessed p-4"
									>
										<div className="text-kumo-subtle text-sm">
											{ASSET_TYPE_LABELS[group.type]}
										</div>
										<div className="font-semibold text-lg tabular-nums">
											{formatCurrency(group.total)}
										</div>
										<p className="text-kumo-subtle text-xs">
											{group.assets.length} holding
											{group.assets.length === 1 ? "" : "s"}
										</p>
									</div>
								))}
							</div>
						</LayerCard>
					</Section>

					<Section title="Value over time">
						<Suspense
							fallback={
								<div className="h-85 animate-pulse rounded-xl bg-kumo-fill" />
							}
						>
							<AssetsChart />
						</Suspense>
					</Section>

					<Section title="Holdings">
						<div className="space-y-6">
							{groups.map((group) => (
								<AssetsGroup
									key={group.type}
									type={group.type}
									assets={group.assets}
									total={group.total}
									onEdit={handleEdit}
									onDelete={handleDelete}
								/>
							))}
						</div>
					</Section>
				</div>
			)}

			{dialog}

			<DeleteConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Delete this asset?"
				description="It is removed from your holdings ledger and cannot be recovered."
				onConfirm={confirmDelete}
				pending={deleteMutation.isPending}
			/>
		</PageContainer>
	);
}
