import { db } from "@moneta/db";
import {
	categories,
	expenses,
	incomes,
	startingBalances,
} from "@moneta/db/schema/moneta";
import type { SQL } from "drizzle-orm";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const querySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	limit: z.string().transform(Number).optional(),
});

function normalizeStartDate(value?: string) {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}

	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	const hasExplicitTime = trimmed.includes("T") || trimmed.includes(":");
	if (hasExplicitTime) {
		return parsed;
	}

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

function normalizeEndDate(value?: string) {
	if (!value) {
		return undefined;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return undefined;
	}

	const parsed = new Date(trimmed);
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	const hasExplicitTime = trimmed.includes("T") || trimmed.includes(":");
	if (hasExplicitTime) {
		return parsed;
	}

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

// Shared helper function for category breakdown (used by both expense-categories and income-categories)
async function getCategoryBreakdown(
	table: typeof expenses | typeof incomes,
	userId: string,
	startDate?: string,
	endDate?: string,
) {
	// Build where conditions
	const conditions: SQL[] = [eq(table.userId, userId)];

	const normalizedStart = normalizeStartDate(startDate);
	if (normalizedStart) {
		conditions.push(gte(table.date, normalizedStart));
	}

	const normalizedEnd = normalizeEndDate(endDate);
	if (normalizedEnd) {
		conditions.push(lte(table.date, normalizedEnd));
	}

	// Get all records grouped by category
	const dataByCategory = await db
		.select({
			categoryId: table.categoryId,
			categoryName: sql<string>`${categories.name}`,
			total: sql<number>`COALESCE(SUM(CAST(${table.amount} AS DECIMAL)), 0)`,
		})
		.from(table)
		.innerJoin(categories, eq(table.categoryId, categories.id))
		.where(and(...conditions))
		.groupBy(table.categoryId, categories.name);

	// Calculate total
	const total = dataByCategory.reduce((sum, cat) => sum + Number(cat.total), 0);

	// Calculate percentages
	const categoriesWithPercentage = dataByCategory.map((cat) => ({
		name: cat.categoryName,
		amount: cat.total.toString(),
		percentage: total > 0 ? (Number(cat.total) / total) * 100 : 0,
	}));

	return categoriesWithPercentage;
}

// Shared helper function for monthly data (used by both monthly-expenses and monthly-income)
async function getMonthlyData(
	table: typeof expenses | typeof incomes,
	userId: string,
	year: number,
) {
	// Query all data for the year using proper date range (UTC boundaries)
	const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
	const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

	const rawData = await db
		.select({
			date: table.date,
			amount: table.amount,
		})
		.from(table)
		.where(
			and(
				eq(table.userId, userId),
				gte(table.date, startOfYear),
				lte(table.date, endOfYear),
			),
		);

	// Group by month using UTC to ensure consistency
	const monthlyTotals = new Map<number, number>();

	for (const item of rawData) {
		const monthIndex = item.date.getUTCMonth();
		const amount = Number(item.amount);
		monthlyTotals.set(
			monthIndex,
			(monthlyTotals.get(monthIndex) || 0) + amount,
		);
	}

	// Convert to array format with proper month string
	const result: Array<{ month: string; amount: string }> = [];
	for (const [monthIndex, total] of monthlyTotals) {
		// Format as YYYY-MM-01 for consistency with existing frontend parsing
		const monthStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
		result.push({
			month: monthStr,
			amount: total.toString(),
		});
	}

	return result;
}

// Get dashboard summary (total income, expenses, net balance)
app.get("/summary", async (c) => {
	const user = c.get("user");
	const query = querySchema.safeParse(c.req.query());

	if (!query.success) {
		return c.json({ error: query.error }, 400);
	}

	const { startDate, endDate } = query.data;
	const normalizedStart = normalizeStartDate(startDate);
	const normalizedEnd = normalizeEndDate(endDate);

	// Build where conditions for filtered period
	const incomeConditions = [eq(incomes.userId, user.id)];
	const expenseConditions = [eq(expenses.userId, user.id)];

	if (normalizedStart) {
		incomeConditions.push(gte(incomes.date, normalizedStart));
		expenseConditions.push(gte(expenses.date, normalizedStart));
	}

	if (normalizedEnd) {
		incomeConditions.push(lte(incomes.date, normalizedEnd));
		expenseConditions.push(lte(expenses.date, normalizedEnd));
	}

	// Calculate total income (filtered)
	const [incomeResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(CAST(${incomes.amount} AS DECIMAL)), 0)`,
		})
		.from(incomes)
		.where(and(...incomeConditions));

	// Calculate total expenses (filtered)
	const [expenseResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
		})
		.from(expenses)
		.where(and(...expenseConditions));

	// Calculate all-time totals for current balance
	const [allIncomeResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(CAST(${incomes.amount} AS DECIMAL)), 0)`,
		})
		.from(incomes)
		.where(eq(incomes.userId, user.id));

	const [allExpenseResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
		})
		.from(expenses)
		.where(eq(expenses.userId, user.id));

	const [startingBalanceResult] = await db
		.select({
			total: sql<number>`COALESCE(SUM(CAST(${startingBalances.amount} AS DECIMAL)), 0)`,
		})
		.from(startingBalances)
		.where(eq(startingBalances.userId, user.id));

	const totalIncome = Number(incomeResult?.total || 0);
	const totalExpenses = Number(expenseResult?.total || 0);
	const netBalance = totalIncome - totalExpenses;

	const allTimeIncome = Number(allIncomeResult?.total || 0);
	const allTimeExpenses = Number(allExpenseResult?.total || 0);
	const totalStartingBalance = Number(startingBalanceResult?.total || 0);
	const currentBalance = totalStartingBalance + allTimeIncome - allTimeExpenses;

	return c.json({
		summary: {
			totalIncome,
			totalExpenses,
			netBalance,
			totalStartingBalance,
			currentBalance,
		},
	});
});

// Get recent transactions (combined income + expenses)
app.get("/transactions", async (c) => {
	const user = c.get("user");
	const query = querySchema.safeParse(c.req.query());

	if (!query.success) {
		return c.json({ error: query.error }, 400);
	}

	const { startDate, endDate, limit = 10 } = query.data;
	const normalizedStart = normalizeStartDate(startDate);
	const normalizedEnd = normalizeEndDate(endDate);

	// Build where conditions
	const incomeConditions = [eq(incomes.userId, user.id)];
	const expenseConditions = [eq(expenses.userId, user.id)];

	if (normalizedStart) {
		incomeConditions.push(gte(incomes.date, normalizedStart));
		expenseConditions.push(gte(expenses.date, normalizedStart));
	}

	if (normalizedEnd) {
		incomeConditions.push(lte(incomes.date, normalizedEnd));
		expenseConditions.push(lte(expenses.date, normalizedEnd));
	}

	// Fetch incomes
	const userIncomes = await db.query.incomes.findMany({
		where: and(...incomeConditions),
		with: {
			category: true,
		},
		limit,
	});

	// Fetch expenses
	const userExpenses = await db.query.expenses.findMany({
		where: and(...expenseConditions),
		with: {
			category: true,
		},
		limit,
	});

	// Combine and transform
	const transactions = [
		...userIncomes.map((income) => ({
			id: income.id,
			date: income.date.toISOString(),
			description: income.description || "",
			category: income.category.name,
			amount: Number(income.amount),
			type: "income" as const,
		})),
		...userExpenses.map((expense) => ({
			id: expense.id,
			date: expense.date.toISOString(),
			description: expense.description || "",
			category: expense.category.name,
			amount: Number(expense.amount),
			type: "expense" as const,
		})),
	]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, limit);

	return c.json({ transactions });
});

// Get chart data (daily aggregated income/expense)
app.get("/chart", async (c) => {
	try {
		const user = c.get("user");
		const query = querySchema.safeParse(c.req.query());

		if (!query.success) {
			return c.json({ error: query.error }, 400);
		}

		const { startDate, endDate } = query.data;
		const normalizedStart = normalizeStartDate(startDate);
		const normalizedEnd = normalizeEndDate(endDate);

		// Build where conditions
		const incomeConditions = [eq(incomes.userId, user.id)];
		const expenseConditions = [eq(expenses.userId, user.id)];

		if (normalizedStart) {
			incomeConditions.push(gte(incomes.date, normalizedStart));
			expenseConditions.push(gte(expenses.date, normalizedStart));
		}

		if (normalizedEnd) {
			incomeConditions.push(lte(incomes.date, normalizedEnd));
			expenseConditions.push(lte(expenses.date, normalizedEnd));
		}

		// Fetch incomes grouped by date
		const incomeData = await db
			.select({
				date: sql<string>`${incomes.date}::date::text`,
				total: sql<number>`COALESCE(SUM(CAST(${incomes.amount} AS DECIMAL)), 0)`,
			})
			.from(incomes)
			.where(and(...incomeConditions))
			.groupBy(sql`${incomes.date}::date`);

		// Fetch expenses grouped by date
		const expenseData = await db
			.select({
				date: sql<string>`${expenses.date}::date::text`,
				total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
			})
			.from(expenses)
			.where(and(...expenseConditions))
			.groupBy(sql`${expenses.date}::date`);

		// Merge data by date
		const dateMap = new Map<string, { income: number; expense: number }>();

		for (const item of incomeData) {
			dateMap.set(item.date, {
				income: Number(item.total),
				expense: 0,
			});
		}

		for (const item of expenseData) {
			const existing = dateMap.get(item.date);
			if (existing) {
				existing.expense = Number(item.total);
			} else {
				dateMap.set(item.date, {
					income: 0,
					expense: Number(item.total),
				});
			}
		}

		// Convert to array and sort by date
		const chartData = Array.from(dateMap.entries())
			.map(([date, data]) => ({
				date,
				income: data.income,
				expense: data.expense,
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		return c.json({ chartData });
	} catch (error) {
		console.error("Chart endpoint error:", error);
		return c.json({ error: "Failed to fetch chart data", chartData: [] }, 500);
	}
});

// Get expense category breakdown (for pie chart)
app.get("/expense-categories", async (c) => {
	try {
		const user = c.get("user");
		const query = querySchema.safeParse(c.req.query());

		if (!query.success) {
			return c.json({ error: query.error }, 400);
		}

		const { startDate, endDate } = query.data;
		const categoriesData = await getCategoryBreakdown(
			expenses,
			user.id,
			startDate,
			endDate,
		);

		return c.json({ categories: categoriesData });
	} catch (error) {
		console.error("Expense categories endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch expense categories", categories: [] },
			500,
		);
	}
});

// Get income category breakdown (for pie chart)
app.get("/income-categories", async (c) => {
	try {
		const user = c.get("user");
		const query = querySchema.safeParse(c.req.query());

		if (!query.success) {
			return c.json({ error: query.error }, 400);
		}

		const { startDate, endDate } = query.data;
		const categoriesData = await getCategoryBreakdown(
			incomes,
			user.id,
			startDate,
			endDate,
		);

		return c.json({ categories: categoriesData });
	} catch (error) {
		console.error("Income categories endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch income categories", categories: [] },
			500,
		);
	}
});

// Get monthly expenses by year (for bar chart)
app.get("/monthly-expenses", async (c) => {
	try {
		const user = c.get("user");
		const year = c.req.query("year") || new Date().getFullYear().toString();

		// Validate year
		const yearNum = Number.parseInt(year, 10);
		if (Number.isNaN(yearNum)) {
			return c.json({ error: "Invalid year parameter" }, 400);
		}

		const monthlyData = await getMonthlyData(expenses, user.id, yearNum);

		return c.json({ monthlyData });
	} catch (error) {
		console.error("Monthly expenses endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch monthly expenses", monthlyData: [] },
			500,
		);
	}
});

// Get monthly income by year (for bar chart)
app.get("/monthly-income", async (c) => {
	try {
		const user = c.get("user");
		const year = c.req.query("year") || new Date().getFullYear().toString();

		// Validate year
		const yearNum = Number.parseInt(year, 10);
		if (Number.isNaN(yearNum)) {
			return c.json({ error: "Invalid year parameter" }, 400);
		}

		const monthlyData = await getMonthlyData(incomes, user.id, yearNum);

		return c.json({ monthlyData });
	} catch (error) {
		console.error("Monthly income endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch monthly income", monthlyData: [] },
			500,
		);
	}
});

export default app;
