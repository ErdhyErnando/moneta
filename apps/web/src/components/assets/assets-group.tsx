import { Button, LayerCard, Table } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	DotsThreeVerticalIcon,
	PencilSimpleIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useCurrency } from "@/contexts/currency-context";
import {
	ASSET_TYPE_LABELS,
	type Asset,
	type AssetType,
	formatQuantity,
} from "@/lib/assets";
import { asUtcDay } from "@/lib/date";

type AssetsGroupProps = {
	type: AssetType;
	assets: Asset[];
	total: number;
	onEdit: (asset: Asset) => void;
	onDelete: (asset: Asset) => void;
};

const TABLE_CLASSES =
	"[&_td]:py-2 [&_th]:border-kumo-hairline [&_th]:text-kumo-subtle [&_th]:text-sm";

/** Row actions — one menu per row at every width (the ledger pattern). */
function AssetRowActions({
	asset,
	onEdit,
	onDelete,
}: {
	asset: Asset;
	onEdit: (asset: Asset) => void;
	onDelete: (asset: Asset) => void;
}): React.JSX.Element {
	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="ghost"
					size="sm"
					shape="square"
					aria-label="Open menu"
					className="max-md:size-11"
					icon={<DotsThreeVerticalIcon size={16} />}
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" className="w-40">
				<DropdownMenu.Item onClick={() => onEdit(asset)}>
					<PencilSimpleIcon size={16} />
					Edit
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item variant="danger" onClick={() => onDelete(asset)}>
					<TrashIcon size={16} />
					Delete
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}

/** `<md` row: name/symbol, quantity + date, amount, actions. */
function StackedAssetRow({
	asset,
	onEdit,
	onDelete,
}: {
	asset: Asset;
	onEdit: (asset: Asset) => void;
	onDelete: (asset: Asset) => void;
}): React.JSX.Element {
	const { formatCurrency } = useCurrency();
	const quantity = formatQuantity(asset.quantity);

	return (
		<li className="flex items-center gap-2 py-2">
			<div className="min-w-0 flex-1">
				<div className="truncate font-medium">{asset.name}</div>
				<div className="flex flex-wrap items-center gap-2 text-kumo-subtle text-sm">
					{asset.symbol ? <span>{asset.symbol}</span> : null}
					{asset.symbol && quantity ? <span aria-hidden="true">·</span> : null}
					{quantity ? <span>qty {quantity}</span> : null}
					<span>{asUtcDay(asset.date).toLocaleDateString()}</span>
				</div>
			</div>
			<div className="shrink-0 text-right font-medium tabular-nums">
				{formatCurrency(Number(asset.amount))}
			</div>
			<AssetRowActions asset={asset} onEdit={onEdit} onDelete={onDelete} />
		</li>
	);
}

/**
 * One asset type: a card header with the group total, a kumo table at `≥md`
 * and a stacked list below it (docs/design.md §7.5 — no column is ever clipped
 * and row actions stay reachable at 375px).
 *
 * Asset values are balances, not P&L: neutral colour, right-aligned,
 * `tabular-nums` (§2.4 — only P&L gets sign + arrow + direction colour).
 */
export function AssetsGroup({
	type,
	assets,
	total,
	onEdit,
	onDelete,
}: AssetsGroupProps): React.JSX.Element {
	const { formatCurrency } = useCurrency();

	return (
		<LayerCard className="gap-0 rounded-xl p-0 shadow-none">
			<div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
				<div className="min-w-0">
					<h3 className="font-semibold text-base text-kumo-strong">
						{ASSET_TYPE_LABELS[type]}
					</h3>
					<p className="text-kumo-subtle text-sm">
						{assets.length} holding{assets.length === 1 ? "" : "s"}
					</p>
				</div>
				<p className="shrink-0 font-semibold text-lg tabular-nums">
					{formatCurrency(total)}
				</p>
			</div>

			<div className="px-6 pb-6">
				<div className="hidden rounded-xl border border-kumo-hairline md:block">
					<Table className={TABLE_CLASSES}>
						<Table.Header>
							<Table.Row>
								<Table.Head>Name</Table.Head>
								<Table.Head className="w-28 text-right">Quantity</Table.Head>
								<Table.Head className="w-44 text-right">Amount</Table.Head>
								<Table.Head className="w-32">Date</Table.Head>
								<Table.Head className="w-16 text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{assets.map((asset) => (
								<Table.Row key={asset.id}>
									<Table.Cell>
										<div className="font-medium">{asset.name}</div>
										{asset.symbol ? (
											<div className="text-kumo-subtle text-xs">
												{asset.symbol}
											</div>
										) : null}
									</Table.Cell>
									<Table.Cell className="text-right tabular-nums">
										{formatQuantity(asset.quantity)}
									</Table.Cell>
									<Table.Cell className="text-right font-medium tabular-nums">
										{formatCurrency(Number(asset.amount))}
									</Table.Cell>
									<Table.Cell className="text-kumo-subtle">
										{asUtcDay(asset.date).toLocaleDateString()}
									</Table.Cell>
									<Table.Cell className="text-right">
										<AssetRowActions
											asset={asset}
											onEdit={onEdit}
											onDelete={onDelete}
										/>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</div>

				<ul className="divide-y divide-kumo-hairline md:hidden">
					{assets.map((asset) => (
						<StackedAssetRow
							key={asset.id}
							asset={asset}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</ul>
			</div>
		</LayerCard>
	);
}
