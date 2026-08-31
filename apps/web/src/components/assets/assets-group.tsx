import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{ASSET_TYPE_LABELS[type]}</CardTitle>
						<CardDescription>
							{assets.length} holding{assets.length === 1 ? "" : "s"}
						</CardDescription>
					</div>
					<p className="font-semibold text-lg">{formatCurrency(total)}</p>
				</div>
			</CardHeader>
			<CardContent>
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
										<div className="text-muted-foreground text-xs">
											{asset.symbol}
										</div>
									)}
								</TableCell>
								<TableCell className="text-right">
									{formatQuantity(asset.quantity)}
								</TableCell>
								<TableCell className="text-right">
									{formatCurrency(Number(asset.amount))}
								</TableCell>
								<TableCell>
									{new Date(asset.date).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(asset)}
											aria-label={`Edit ${asset.name}`}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(asset)}
											aria-label={`Delete ${asset.name}`}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
