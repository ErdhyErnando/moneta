import { Button, LayerCard } from "@cloudflare/kumo";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/contexts/currency-context";
import {
	ASSET_TYPE_LABELS,
	type Asset,
	type AssetType,
	formatQuantity,
} from "@/lib/assets";

type AssetsGroupProps = {
	type: AssetType;
	assets: Asset[];
	total: number;
	onEdit: (asset: Asset) => void;
	onDelete: (asset: Asset) => void;
};

export function AssetsGroup({
	type,
	assets,
	total,
	onEdit,
	onDelete,
}: AssetsGroupProps) {
	const { formatCurrency } = useCurrency();

	return (
		<LayerCard className="gap-0 rounded-xl p-0 shadow-none">
			<div className="flex items-center justify-between px-6 pt-6 pb-4">
				<div>
					<div className="font-semibold text-base">
						{ASSET_TYPE_LABELS[type]}
					</div>
					<div className="text-kumo-subtle text-sm">
						{assets.length} holding{assets.length === 1 ? "" : "s"}
					</div>
				</div>
				<p className="font-semibold text-lg tabular-nums">
					{formatCurrency(total)}
				</p>
			</div>
			<div className="px-6 pb-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead className="text-right">Quantity</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className="w-[90px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{assets.map((asset) => (
							<TableRow key={asset.id}>
								<TableCell>
									<div className="font-medium">{asset.name}</div>
									{asset.symbol && (
										<div className="text-kumo-subtle text-xs">
											{asset.symbol}
										</div>
									)}
								</TableCell>
								<TableCell className="text-right">
									{formatQuantity(asset.quantity)}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{formatCurrency(Number(asset.amount))}
								</TableCell>
								<TableCell>
									{new Date(asset.date).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="sm"
											shape="square"
											onClick={() => onEdit(asset)}
											aria-label={`Edit ${asset.name}`}
											icon={<PencilSimpleIcon size={16} />}
										/>
										<Button
											variant="ghost"
											size="sm"
											shape="square"
											onClick={() => onDelete(asset)}
											aria-label={`Delete ${asset.name}`}
											icon={<TrashIcon size={16} />}
										/>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</LayerCard>
	);
}
