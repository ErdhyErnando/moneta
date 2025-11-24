import { db } from "@moneta/db";
import { expenses } from "@moneta/db/schema/moneta";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const expenseSchema = z.object({
	amount: z.string().transform((val) => val.toString()),
	description: z.string().optional(),
	date: z.string().transform((str) => new Date(str)),
	categoryId: z.number(),
});

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
	const body = await c.req.json();
	const result = expenseSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
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
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const result = expenseSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [updatedExpense] = await db
		.update(expenses)
		.set(result.data)
		.where(and(eq(expenses.id, id), eq(expenses.userId, user.id)))
		.returning();

	if (!updatedExpense) {
		return c.json({ error: "Expense not found" }, 404);
	}

	return c.json({ expense: updatedExpense });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));
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
