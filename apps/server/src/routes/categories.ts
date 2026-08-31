import { db } from "@moneta/db";
import { categories } from "@moneta/db/schema/moneta";
import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
	ensureUserDefaultCategories,
	hasActiveUserCategoryName,
} from "../category-utils";

const app = new Hono<{ Variables: { user: { id: string } } }>();

const categoryTypeSchema = z.enum(["income", "expense", "starting_balance"]);

const createCategorySchema = z.object({
	name: z.string().trim().min(1).max(100),
	type: categoryTypeSchema,
	color: z
		.string()
		.trim()
		.regex(/^#[0-9a-fA-F]{6}$/, "color must be a valid hex code (e.g. #0ea5e9)")
		.optional(),
});

const updateCategorySchema = z.object({
	name: z.string().trim().min(1).max(100),
	color: z
		.string()
		.trim()
		.regex(/^#[0-9a-fA-F]{6}$/, "color must be a valid hex code (e.g. #0ea5e9)")
		.optional(),
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

const legacyUpdateCategorySchema = updateCategorySchema.extend({
	type: categoryTypeSchema.optional(),
});

function serializeCategory(category: typeof categories.$inferSelect) {
	return {
		id: category.id,
		name: category.name,
		type: category.type,
		color: category.color,
		isArchived: category.isArchived,
	};
}

app.get("/", async (c) => {
	const user = c.get("user");
	const includeArchived = c.req.query("includeArchived") === "true";

	await ensureUserDefaultCategories(user.id);

	const conditions = [eq(categories.userId, user.id)];
	if (!includeArchived) {
		conditions.push(eq(categories.isArchived, false));
	}

	const userCategories = await db.query.categories.findMany({
		where: and(...conditions),
		orderBy: [asc(categories.type), asc(categories.name)],
	});

	return c.json({ categories: userCategories.map(serializeCategory) });
});

app.post("/", async (c) => {
	const user = c.get("user");
	const body = await readJson(c);
	if (!body) {
		return c.json({ error: { message: "Invalid JSON body" } }, 400);
	}
	const result = createCategorySchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const hasDuplicate = await hasActiveUserCategoryName(
		user.id,
		result.data.name,
		result.data.type,
	);

	if (hasDuplicate) {
		return c.json({ error: { message: "Category already exists" } }, 409);
	}

	const [newCategory] = await db
		.insert(categories)
		.values({
			...result.data,
			userId: user.id,
		})
		.returning();

	if (!newCategory) {
		return c.json({ error: { message: "Failed to create category" } }, 500);
	}

	return c.json({ category: serializeCategory(newCategory) }, 201);
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
	const result = legacyUpdateCategorySchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const category = await db.query.categories.findFirst({
		where: and(eq(categories.id, id), eq(categories.userId, user.id)),
	});

	if (!category) {
		return c.json({ error: "Category not found" }, 404);
	}

	if (result.data.type && result.data.type !== category.type) {
		return c.json(
			{ error: { message: "Category type cannot be changed" } },
			400,
		);
	}

	const hasDuplicate = await hasActiveUserCategoryName(
		user.id,
		result.data.name,
		category.type,
		id,
	);

	if (hasDuplicate) {
		return c.json({ error: { message: "Category already exists" } }, 409);
	}

	const updatePayload: Partial<typeof categories.$inferInsert> = {
			name: result.data.name,
		};
		if (result.data.color) {
			updatePayload.color = result.data.color;
		}
		const [updatedCategory] = await db
			.update(categories)
			.set(updatePayload)
			.where(and(eq(categories.id, id), eq(categories.userId, user.id)))
			.returning();

	if (!updatedCategory) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json({ category: serializeCategory(updatedCategory) });
});

app.delete("/:id", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const [archivedCategory] = await db
		.update(categories)
		.set({ isArchived: true })
		.where(and(eq(categories.id, id), eq(categories.userId, user.id)))
		.returning();

	if (!archivedCategory) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json({ category: serializeCategory(archivedCategory) });
});

app.post("/:id/restore", async (c) => {
	const user = c.get("user");
	const id = parseId(c);
	if (id === null) {
		return c.json({ error: { message: "Invalid id parameter" } }, 400);
	}
	const category = await db.query.categories.findFirst({
		where: and(eq(categories.id, id), eq(categories.userId, user.id)),
	});

	if (!category) {
		return c.json({ error: "Category not found" }, 404);
	}

	const hasDuplicate = await hasActiveUserCategoryName(
		user.id,
		category.name,
		category.type,
		id,
	);

	if (hasDuplicate) {
		return c.json(
			{
				error: { message: "An active category with this name already exists" },
			},
			409,
		);
	}

	const [restoredCategory] = await db
		.update(categories)
		.set({ isArchived: false })
		.where(and(eq(categories.id, id), eq(categories.userId, user.id)))
		.returning();

	if (!restoredCategory) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json({ category: serializeCategory(restoredCategory) });
});

export default app;
