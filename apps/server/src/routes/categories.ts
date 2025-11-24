import { db } from "@moneta/db";
import { categories } from "@moneta/db/schema/moneta";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

const categorySchema = z.object({
	name: z.string().min(1),
	type: z.enum(["income", "expense"]),
});

app.get("/", async (c) => {
	const allCategories = await db.query.categories.findMany();
	return c.json({ categories: allCategories });
});

app.post("/", async (c) => {
	const body = await c.req.json();
	const result = categorySchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [newCategory] = await db
		.insert(categories)
		.values(result.data)
		.returning();

	return c.json({ category: newCategory }, 201);
});

app.put("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const body = await c.req.json();
	const result = categorySchema.safeParse(body);

	if (!result.success) {
		return c.json({ error: result.error }, 400);
	}

	const [updatedCategory] = await db
		.update(categories)
		.set(result.data)
		.where(eq(categories.id, id))
		.returning();

	if (!updatedCategory) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json({ category: updatedCategory });
});

app.delete("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const [deletedCategory] = await db
		.delete(categories)
		.where(eq(categories.id, id))
		.returning();

	if (!deletedCategory) {
		return c.json({ error: "Category not found" }, 404);
	}

	return c.json({ category: deletedCategory });
});

export default app;
