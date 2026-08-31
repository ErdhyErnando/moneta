export const ASSET_TYPES = [
	"stock",
	"bond",
	"cash",
	"crypto",
	"other",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export type Asset = {
	id: number;
	type: AssetType;
	name: string;
	symbol: string | null;
	quantity: string | null;
	amount: string;
	date: string;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
	stock: "Stocks",
	bond: "Bonds",
	cash: "Cash",
	crypto: "Crypto",
	other: "Other",
};

export function formatQuantity(quantity: string | null): string {
	if (!quantity) return "";
	return Number(quantity).toString();
}
