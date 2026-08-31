import { db } from "@moneta/db";
import { categories, expenses, incomes } from "@moneta/db/schema/moneta";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

// #33 ledger query validation (Zod patterns per #24 — invalid params → 400)
const isoDateString = z
	.string()
	.trim()
	.min(1)
	.refine(
		(s) => !Number.isNaN(new Date(s).getTime()),
		"must be a valid ISO date",
	);

const querySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
	type: z.enum(["all", "income", "expense"]).default("all"),
	sort: z.enum(["date", "amount"]).default("date"),
	dir: z.enum(["asc", "desc"]).default("desc"),
	categoryId: z.coerce.number().int().positive().optional(),
	from: isoDateString.optional(),
	to: isoDateString.optional(),
	q: z.string().trim().max(280).optional(),
	minAmount: z.coerce.number().nonnegative().optional(),
	maxAmount: z.coerce.number().nonnegative().optional(),
});

// Date-only strings get UTC day boundaries (consistent with dashboard.ts #22);
// values with an explicit time are used as-is.
function startOfDayUtc(value?: string): Date | undefined {
	if (value === undefined) return undefined;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return undefined;
	if (value.includes("T") || value.includes(":")) return parsed;
	return new Date(
		Date.UTC(
			parsed.getUTCFullYear(),
			parsed.getUTCMonth(),
			parsed.getUTCDate(),
			0,
			0,
			0,
			0,
		),
	);
}

function endOfDayUtc(value?: string): Date | undefined {
	if (value === undefined) return undefined;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return undefined;
	if (value.includes("T") || value.includes(":")) return parsed;
	return new Date(
		Date.UTC(
			parsed.getUTCFullYear(),
			parsed.getUTCMonth(),
			parsed.getUTCDate(),
			23,
			59,
			59,
			999,
		),
	);
}

function escapeLike(value: string): string {
	return `%${value.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}

app.get("/", async (c) => {
	const user = c.get("user");
	const query = querySchema.safeParse(c.req.query());

	if (!query.success) {
		return c.json({ error: query.error }, 400);
	}

	const {
		page,
		pageSize,
		type,
		sort,
		dir,
		categoryId,
		from,
		to,
		q,
		minAmount,
		maxAmount,
	} = query.data;

	const start = startOfDayUtc(from);
	const end = endOfDayUtc(to);
	const pattern = q ? escapeLike(q) : undefined;

	const incomeFilters = [eq(incomes.userId, user.id)];
	const expenseFilters = [eq(expenses.userId, user.id)];
	if (categoryId !== undefined) {
		incomeFilters.push(eq(incomes.categoryId, categoryId));
		expenseFilters.push(eq(expenses.categoryId, categoryId));
	}
	if (start) {
		incomeFilters.push(gte(incomes.date, start));
		expenseFilters.push(gte(expenses.date, start));
	}
	if (end) {
		incomeFilters.push(lte(incomes.date, end));
		expenseFilters.push(lte(expenses.date, end));
	}
	if (pattern) {
		// Search matches description or category name (per #33 "search").
		incomeFilters.push(
			sql`(${incomes.description} ilike ${pattern} or ${categories.name} ilike ${pattern})`,
		);
		expenseFilters.push(
			sql`(${expenses.description} ilike ${pattern} or ${categories.name} ilike ${pattern})`,
		);
	}
	if (minAmount !== undefined) {
		incomeFilters.push(gte(incomes.amount, String(minAmount)));
		expenseFilters.push(gte(expenses.amount, String(minAmount)));
	}
	if (maxAmount !== undefined) {
		incomeFilters.push(lte(incomes.amount, String(maxAmount)));
		expenseFilters.push(lte(expenses.amount, String(maxAmount)));
	}

	const incomeWhere = and(...incomeFilters);
	const expenseWhere = and(...expenseFilters);

	const incomeSelect = db
		.select({
			id: incomes.id,
			date: incomes.date,
			amount: incomes.amount,
			description: incomes.description,
			categoryId: incomes.categoryId,
			categoryName: categories.name,
			categoryColor: categories.color,
			type: sql<string>`${sql.raw("'income'")} as type`,
		})
		.from(incomes)
		.innerJoin(categories, eq(incomes.categoryId, categories.id))
		.where(incomeWhere);

	const expenseSelect = db
		.select({
			id: expenses.id,
			date: expenses.date,
			amount: expenses.amount,
			description: expenses.description,
			categoryId: expenses.categoryId,
			categoryName: categories.name,
			categoryColor: categories.color,
			type: sql<string>`${sql.raw("'expense'")} as type`,
		})
		.from(expenses)
		.innerJoin(categories, eq(expenses.categoryId, categories.id))
		.where(expenseWhere);

	const includeIncome = type !== "expense";
	const includeExpense = type !== "income";

	// Stable ordering: user sort + date/id tiebreakers so pages never
	// duplicate/drop rows (#33 acceptance).
	const orderBy = [
		sort === "amount"
			? dir === "asc"
				? sql`amount asc`
				: sql`amount desc`
			: dir === "asc"
				? sql`date asc`
				: sql`date desc`,
		sql`date desc`,
		sql`id desc`,
	];

	const offset = (page - 1) * pageSize;

	let rows: Array<{
		id: number;
		date: Date;
		amount: string;
		description: string | null;
		categoryId: number;
		categoryName: string;
		categoryColor: string | null;
		type: string;
	}>;

	if (includeIncome && includeExpense) {
		rows = await unionAll(incomeSelect, expenseSelect)
			.orderBy(...orderBy)
			.limit(pageSize)
			.offset(offset);
	} else {
		rows = await (includeIncome ? incomeSelect : expenseSelect)
			.orderBy(...orderBy)
			.limit(pageSize)
			.offset(offset);
	}

	const [incomeCountRow] = includeIncome
		? await db
				.select({ n: sql<number>`count(*)::int` })
				.from(incomes)
				.innerJoin(categories, eq(incomes.categoryId, categories.id))
				.where(incomeWhere)
		: [];
	const [expenseCountRow] = includeExpense
		? await db
				.select({ n: sql<number>`count(*)::int` })
				.from(expenses)
				.innerJoin(categories, eq(expenses.categoryId, categories.id))
				.where(expenseWhere)
		: [];

	const total = (incomeCountRow?.n ?? 0) + (expenseCountRow?.n ?? 0);

	return c.json({
		mutations: rows.map((row) => ({
			id: row.id,
			type: row.type,
			date: row.date.toISOString(),
			amount: row.amount,
			description: row.description ?? "",
			categoryId: row.categoryId,
			categoryName: row.categoryName,
			categoryColor: row.categoryColor,
		})),
		page,
		pageSize,
		total,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	});
});

export default app;
