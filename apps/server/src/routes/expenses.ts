import { db } from "@moneta/db";
import { expenses } from "@moneta/db/schema/moneta";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { isActiveUserCategory } from "../category-utils";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const expenseSchema = z.object({
	amount: z
		.string()
		.trim()
		.regex(
			/^\d+(\.\d{1,2})?$/,
			"amount must be a non-negative decimal with up to 2 fractional digits",
		)
		.refine((v) => Number(v) > 0, "amount must be positive"),
	description: z.string().trim().max(280).optional(),
	date: z
		.string()
		.refine(
			(s) => !Number.isNaN(new Date(s).getTime()),
			"date must be a valid ISO date",
		)
		.transform((s) => new Date(s)),
	categoryId: z.number().int().positive(),
});

function parseId(c: {
	req: { param: (name: string) => string };
}): number | null {
	const n = Number(c.req.param("id"));
	if (!Number.isInteger(n) || n <= 0) return null;
	return n;
}

async function readJson<T>(c: {
	req: { json: () => Promise<T> };
}): Promise<T | null> {
	try {
		return (await c.req.json()) as T;
	} catch {
		return null;
	}
}

app.get("/", async (c) => {
	const user = c.get("user");
	const userExpenses = await db.query.expenses.findMany({
		where: eq(expenses.userId, user.id),
		orderBy: [desc(expenses.date)],
		with: {
			category: true,
		},
	});
	return c.json({ expenses: userExpenses });
});

app.post("/", async (c) => {
	const user = c.get("user");
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = expenseSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const hasCategoryAccess = await isActiveUserCategory(
		user.id,
		result.data.categoryId,
		"expense",
	);

	if (!hasCategoryAccess) {
		return c.json({ error: { message: "Category not found" } }, 400);
	}

	const [newExpense] = await db
		.insert(expenses)
		.values({
			...result.data,
			userId: user.id,
		})
		.returning();

	return c.json({ expense: newExpense }, 201);
});

app.put("/:id", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = expenseSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const existingExpense = await db.query.expenses.findFirst({
		where: and(eq(expenses.id, id), eq(expenses.userId, user.id)),
	});

	if (!existingExpense) {
		return c.json({ error: "Expense not found" }, 404);
	}

	if (existingExpense.categoryId !== result.data.categoryId) {
		const hasCategoryAccess = await isActiveUserCategory(
			user.id,
			result.data.categoryId,
			"expense",
		);

		if (!hasCategoryAccess) {
			return c.json({ error: { message: "Category not found" } }, 400);
		}
	}

	const [updatedExpense] = await db
		.update(expenses)
		.set(result.data)
		.where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
		.returning();

	return c.json({ expense: updatedExpense });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const [deletedExpense] = await db
		.delete(expenses)
		.where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
		.returning();

	if (!deletedExpense) {
		return c.json({ error: "Expense not found" }, 404);
	}

	return c.json({ expense: deletedExpense });
});

export default app;
