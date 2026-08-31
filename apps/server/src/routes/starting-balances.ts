import { db } from "@moneta/db";
import { startingBalances } from "@moneta/db/schema/moneta";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { isActiveUserCategory } from "../category-utils";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const startingBalanceSchema = z.object({
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
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = startingBalanceSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const hasCategoryAccess = await isActiveUserCategory(
		user.id,
		result.data.categoryId,
		"starting_balance",
	);

	if (!hasCategoryAccess) {
		return c.json({ error: { message: "Category not found" } }, 400);
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
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = startingBalanceSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const existingBalance = await db.query.startingBalances.findFirst({
		where: and(
			eq(startingBalances.id, id),
			eq(startingBalances.userId, user.id),
		),
	});

	if (!existingBalance) {
		return c.json({ error: "Starting balance not found" }, 404);
	}

	if (existingBalance.categoryId !== result.data.categoryId) {
		const hasCategoryAccess = await isActiveUserCategory(
			user.id,
			result.data.categoryId,
			"starting_balance",
		);

		if (!hasCategoryAccess) {
			return c.json({ error: { message: "Category not found" } }, 400);
		}
	}

	const [updatedBalance] = await db
		.update(startingBalances)
		.set(result.data)
		.where(
			and(eq(startingBalances.id, id), eq(startingBalances.userId, user.id)),
		)
		.returning();

	return c.json({ startingBalance: updatedBalance });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
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
