import { z } from "zod";

// #33 — /mutations ledger types, URL search schema and helpers.

export type MutationRow = {
	id: number;
	type: "income" | "expense";
	/** ISO string, UTC */
	date: string;
	amount: string;
	description: string;
	categoryId: number;
	categoryName: string;
	categoryColor: string | null;
};

export type MutationsResponse = {
	mutations: MutationRow[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

// Lenient schema: malformed URL params fall back to defaults (.catch) so
// shareable links degrade gracefully instead of throwing.
export const mutationsSearchSchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	size: z.coerce.number().int().min(1).max(100).catch(20),
	type: z.enum(["all", "income", "expense"]).catch("all"),
	sort: z.enum(["date", "amount"]).catch("date"),
	dir: z.enum(["asc", "desc"]).catch("desc"),
	categoryId: z.coerce.number().int().positive().optional().catch(undefined),
	from: z.string().catch(""),
	to: z.string().catch(""),
	q: z.string().catch(""),
	min: z.coerce.number().nonnegative().optional().catch(undefined),
	max: z.coerce.number().nonnegative().optional().catch(undefined),
});

export type MutationsSearch = z.output<typeof mutationsSearchSchema>;

export const MUTATIONS_DEFAULTS: MutationsSearch = {
	page: 1,
	size: 20,
	type: "all",
	sort: "date",
	dir: "desc",
	categoryId: undefined,
	from: "",
	to: "",
	q: "",
	min: undefined,
	max: undefined,
};

/** Strip default/empty values so the URL stays clean and shareable (#33). */
export function partializeMutationsSearch(
	search: MutationsSearch,
): Partial<MutationsSearch> {
	const out: Partial<MutationsSearch> = {};
	if (search.page !== MUTATIONS_DEFAULTS.page) out.page = search.page;
	if (search.size !== MUTATIONS_DEFAULTS.size) out.size = search.size;
	if (search.type !== MUTATIONS_DEFAULTS.type) out.type = search.type;
	if (search.sort !== MUTATIONS_DEFAULTS.sort) out.sort = search.sort;
	if (search.dir !== MUTATIONS_DEFAULTS.dir) out.dir = search.dir;
	if (search.categoryId !== undefined) out.categoryId = search.categoryId;
	if (search.from) out.from = search.from;
	if (search.to) out.to = search.to;
	if (search.q) out.q = search.q;
	if (search.min !== undefined) out.min = search.min;
	if (search.max !== undefined) out.max = search.max;
	return out;
}

export function mutationsSearchToApiParams(search: MutationsSearch) {
	return {
		page: search.page,
		pageSize: search.size,
		type: search.type,
		sort: search.sort,
		dir: search.dir,
		categoryId: search.categoryId,
		from: search.from || undefined,
		to: search.to || undefined,
		q: search.q || undefined,
		minAmount: search.min,
		maxAmount: search.max,
	};
}

export function dayStartIso(d: Date): string {
	return new Date(
		d.getFullYear(),
		d.getMonth(),
		d.getDate(),
		0,
		0,
		0,
		0,
	).toISOString();
}

export function dayEndIso(d: Date): string {
	return new Date(
		d.getFullYear(),
		d.getMonth(),
		d.getDate(),
		23,
		59,
		59,
		999,
	).toISOString();
}
