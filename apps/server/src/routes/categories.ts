import { db } from "@moneta/db";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
	const categories = await db.query.categories.findMany();
	return c.json({ categories });
});

export default app;
