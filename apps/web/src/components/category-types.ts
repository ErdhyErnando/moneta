// Shared category domain types (#49). Kept in a component-free module so
// files that export components stay Fast Refresh-safe.
export const categoryTypes = ["income", "expense", "starting_balance"] as const;

export type CategoryType = (typeof categoryTypes)[number];

/**
 * Default colour for a new category (docs/design.md §2.7). The brand hue (156)
 * is not allowed for categories, so this is the contract's neutral "Other"
 * value (C < 0.05, so the ≥30° hue rule does not apply).
 */
export const DEFAULT_CATEGORY_COLOR = "#867f79";

export type Category = {
	id: number;
	name: string;
	type: CategoryType;
	color: string;
	isArchived: boolean;
};
