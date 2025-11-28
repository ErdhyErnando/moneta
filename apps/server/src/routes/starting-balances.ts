import { db } from "@moneta/db";
import { startingBalances } from "@moneta/db/schema/moneta";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const startingBalanceSchema = z.object({
	amount: z.string().transform((val) => val.toString()),
	description: z.string().optional(),
	date: z.string().transform((str) => new Date(str)),
	categoryId: z.number(),
});

app.get("/", async (c) => {
	const user = c.get("user");
	const balances = await db.query.startingBalances.findMany({
		where: eq(startingBalances.userId, user.id),
		orderBy: [desc(startingBalances.date)],
		with: {
			category: true,
		},
	});
	return c.json({ startingBalances: balances });
});

app.post("/", async (c) => {
	const user = c.get("user");
	const body = await c.req.json();
	const result = startingBalanceSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [newBalance] = await db
		.insert(startingBalances)
		.values({
			...result.data,
			userId: user.id,
		})
		.returning();

	return c.json({ startingBalance: newBalance }, 201);
});

app.put("/:id", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const result = startingBalanceSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [updatedBalance] = await db
		.update(startingBalances)
		.set(result.data)
		.where(
			and(eq(startingBalances.id, id), eq(startingBalances.userId, user.id)),
		)
		.returning();

	if (!updatedBalance) {
		return c.json({ error: "Starting balance not found" }, 404);
	}

	return c.json({ startingBalance: updatedBalance });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = Number(c.req.param("id"));
	const [deletedBalance] = await db
		.delete(startingBalances)
		.where(
			and(eq(startingBalances.id, id), eq(startingBalances.userId, user.id)),
		)
		.returning();

	if (!deletedBalance) {
		return c.json({ error: "Starting balance not found" }, 404);
	}

	return c.json({ startingBalance: deletedBalance });
});

export default app;
