import { db } from "@moneta/db";
import {
	categories,
	expenses,
	incomes,
	startingBalances,
} from "@moneta/db/schema/moneta";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const querySchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	limit: z.string().transform(Number).optional(),
});

// Get dashboard summary (total income, expenses, net balance)
app.get("/summary", async (c) => {
	const user = c.get("user");
	const query = querySchema.safeParse(c.req.query());

	if (!query.success) {
		return c.json({ error: query.error }, 400);
	}

	const { startDate, endDate } = query.data;

	// Build where conditions for filtered period
	const incomeConditions = [eq(incomes.userId, user.id)];
	const expenseConditions = [eq(expenses.userId, user.id)];

	if (startDate) {
		incomeConditions.push(gte(incomes.date, new Date(startDate)));
		expenseConditions.push(gte(expenses.date, new Date(startDate)));
	}

	if (endDate) {
		incomeConditions.push(lte(incomes.date, new Date(endDate)));
		expenseConditions.push(lte(expenses.date, new Date(endDate)));
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

	// Build where conditions
	const incomeConditions = [eq(incomes.userId, user.id)];
	const expenseConditions = [eq(expenses.userId, user.id)];

	if (startDate) {
		incomeConditions.push(gte(incomes.date, new Date(startDate)));
		expenseConditions.push(gte(expenses.date, new Date(startDate)));
	}

	if (endDate) {
		incomeConditions.push(lte(incomes.date, new Date(endDate)));
		expenseConditions.push(lte(expenses.date, new Date(endDate)));
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

		// Build where conditions
		const incomeConditions = [eq(incomes.userId, user.id)];
		const expenseConditions = [eq(expenses.userId, user.id)];

		if (startDate) {
			incomeConditions.push(gte(incomes.date, new Date(startDate)));
			expenseConditions.push(gte(expenses.date, new Date(startDate)));
		}

		if (endDate) {
			incomeConditions.push(lte(incomes.date, new Date(endDate)));
			expenseConditions.push(lte(expenses.date, new Date(endDate)));
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

		// Get all expenses grouped by category
		const expensesByCategory = await db
			.select({
				categoryId: expenses.categoryId,
				categoryName: sql<string>`${categories.name}`,
				total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
			})
			.from(expenses)
			.innerJoin(categories, eq(expenses.categoryId, categories.id))
			.where(eq(expenses.userId, user.id))
			.groupBy(expenses.categoryId, categories.name);

		// Calculate total expenses
		const totalExpenses = expensesByCategory.reduce(
			(sum, cat) => sum + Number(cat.total),
			0,
		);

		// Calculate percentages
		const categoriesWithPercentage = expensesByCategory.map((cat) => ({
			name: cat.categoryName,
			amount: cat.total.toString(),
			percentage:
				totalExpenses > 0 ? (Number(cat.total) / totalExpenses) * 100 : 0,
		}));

		return c.json({ categories: categoriesWithPercentage });
	} catch (error) {
		console.error("Expense categories endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch expense categories", categories: [] },
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

		// Get expenses grouped by month for the specified year
		const monthlyExpenses = await db
			.select({
				month: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM-01')`,
				total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
			})
			.from(expenses)
			.where(
				and(
					eq(expenses.userId, user.id),
					sql`EXTRACT(YEAR FROM ${expenses.date}) = ${yearNum}`,
				),
			)
			.groupBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM-01')`);

		// Transform to array with month string
		const monthlyData = monthlyExpenses.map((item) => ({
			month: item.month,
			amount: item.total.toString(),
		}));

		return c.json({ monthlyData });
	} catch (error) {
		console.error("Monthly expenses endpoint error:", error);
		return c.json(
			{ error: "Failed to fetch monthly expenses", monthlyData: [] },
			500,
		);
	}
});

export default app;
