import { db } from "@moneta/db";
import { incomes } from "@moneta/db/schema/moneta";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const incomeSchema = z.object({
	amount: z.string().transform((val) => val.toString()),
	description: z.string().optional(),
	date: z.string().transform((str) => new Date(str)),
	categoryId: z.number(),
});

app.get("/", async (c) => {
	const user = c.get("user");
	const userIncomes = await db.query.incomes.findMany({
		where: eq(incomes.userId, user.id),
		orderBy: [desc(incomes.date)],
		with: {
			category: true,
		},
	});
	return c.json({ incomes: userIncomes });
});

app.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json();
	const result = incomeSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [newIncome] = await db
		.insert(incomes)
		.values({
			...result.data,
			userId: user.id,
		})
		.returning();

	return c.json({ income: newIncome }, 201);
});

app.put("/:id", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const result = incomeSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [updatedIncome] = await db
		.update(incomes)
		.set(result.data)
		.where(and(eq(incomes.id, id), eq(incomes.userId, user.id)))
		.returning();

	if (!updatedIncome) {
		return c.json({ error: "Income not found" }, 404);
	}

	return c.json({ income: updatedIncome });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));
	const [deletedIncome] = await db
		.delete(incomes)
		.where(and(eq(incomes.id, id), eq(incomes.userId, user.id)))
		.returning();

	if (!deletedIncome) {
		return c.json({ error: "Income not found" }, 404);
	}

	return c.json({ income: deletedIncome });
});

export default app;
