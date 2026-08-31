import { db } from "@moneta/db";
import { assets, assetTypeEnum } from "@moneta/db/schema/moneta";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { nearestUtcDay } from "../date-utils";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const assetTypes = assetTypeEnum.enumValues;

const assetSchema = z.object({
	type: z.enum(assetTypes),
	name: z.string().trim().min(1, "name is required").max(120),
	symbol: z.string().trim().max(20).optional(),
	quantity: z
		.string()
		.trim()
		.optional()
		.refine(
			(v) => v === undefined || /^\d+(\.\d{1,8})?$/.test(v),
			"quantity must be a non-negative decimal with up to 8 fractional digits",
		),
	amount: z
		.string()
		.trim()
		.regex(
			/^\d+(\.\d{1,2})?$/,
			"amount must be a non-negative decimal with up to 2 fractional digits",
		)
		.refine((v) => Number(v) > 0, "amount must be positive"),
	date: z
		.string()
		.refine(
			(s) => !Number.isNaN(new Date(s).getTime()),
			"date must be a valid ISO date",
		)
		.transform((s) => nearestUtcDay(new Date(s))),
	notes: z.string().trim().max(280).optional(),
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
	const userAssets = await db.query.assets.findMany({
		where: eq(assets.userId, user.id),
		orderBy: [desc(assets.date), desc(assets.id)],
	});
	return c.json({ assets: userAssets });
});

// Monthly totals aggregation (same DATE_TRUNC pattern as dashboard.ts, #22-safe)
app.get("/monthly", async (c) => {
	const user = c.get("user");
	const year = Number(c.req.query("year") || new Date().getUTCFullYear());

	if (!Number.isInteger(year) || year < 1970 || year > 2100) {
		return c.json({ error: { message: "Invalid year parameter" } }, 400);
	}

	const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
	const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

	const monthlyData = await db
		.select({
			month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${assets.date} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
			total: sql<number>`COALESCE(SUM(CAST(${assets.amount} AS DECIMAL)), 0)`,
		})
		.from(assets)
		.where(
			and(
				eq(assets.userId, user.id),
				gte(assets.date, startOfYear),
				lte(assets.date, endOfYear),
			),
		)
		.groupBy(sql`DATE_TRUNC('month', ${assets.date} AT TIME ZONE 'UTC')`)
		.orderBy(sql`DATE_TRUNC('month', ${assets.date} AT TIME ZONE 'UTC')`);

	return c.json({
		monthlyData: monthlyData.map((item) => ({
			month: item.month,
			amount: item.total.toString(),
		})),
	});
});

app.post("/", async (c) => {
	const user = c.get("user");
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = assetSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [newAsset] = await db
		.insert(assets)
		.values({
			...result.data,
			userId: user.id,
		})
		.returning();

	return c.json({ asset: newAsset }, 201);
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
	const result = assetSchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const existingAsset = await db.query.assets.findFirst({
		where: and(eq(assets.id, id), eq(assets.userId, user.id)),
	});

	if (!existingAsset) {
		return c.json({ error: "Asset not found" }, 404);
	}

	const [updatedAsset] = await db
		.update(assets)
		.set(result.data)
		.where(and(eq(assets.id, id), eq(assets.userId, user.id)))
		.returning();

	return c.json({ asset: updatedAsset });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const [deletedAsset] = await db
		.delete(assets)
		.where(and(eq(assets.id, id), eq(assets.userId, user.id)))
		.returning();

	if (!deletedAsset) {
		return c.json({ error: "Asset not found" }, 404);
	}

	return c.json({ asset: deletedAsset });
});

export default app;
