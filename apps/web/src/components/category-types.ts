// Shared category domain types (#49). Kept in a component-free module so
// files that export components stay Fast Refresh-safe.
export const categoryTypes = ["income", "expense", "starting_balance"] as const;

export type CategoryType = (typeof categoryTypes)[number];

export type Category = {
	id: number;
	name: string;
	type: CategoryType;
	color: string;
	isArchived: boolean;
};
