import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

// Try to load .env from root or apps/server
dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../../apps/server/.env" });

const { db } = await import(".");
const { categories } = await import("./schema/moneta");

const DEFAULT_CATEGORIES: (typeof categories.$inferInsert)[] = [
	{ name: "Salary", type: "income", color: "#10b981" },
	{ name: "Freelance", type: "income", color: "#0ea5e9" },
	{ name: "Investments", type: "income", color: "#8b5cf6" },
	{ name: "Gift", type: "income", color: "#f59e0b" },
	{ name: "Other Income", type: "income", color: "#06b6d4" },
	{ name: "Rent", type: "expense", color: "#ef4444" },
	{ name: "Groceries", type: "expense", color: "#22c55e" },
	{ name: "Utilities", type: "expense", color: "#3b82f6" },
	{ name: "Transportation", type: "expense", color: "#f97316" },
	{ name: "Entertainment", type: "expense", color: "#ec4899" },
	{ name: "Healthcare", type: "expense", color: "#14b8a6" },
	{ name: "Shopping", type: "expense", color: "#a855f7" },
	{ name: "Dining Out", type: "expense", color: "#facc15" },
	{ name: "Travel", type: "expense", color: "#6366f1" },
	{ name: "Education", type: "expense", color: "#84cc16" },
	{ name: "Other Expense", type: "expense", color: "#71717a" },
	{ name: "Savings", type: "starting_balance", color: "#0ea5e9" },
	{ name: "Cash on Hand", type: "starting_balance", color: "#22c55e" },
];

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}
	console.log("Seeding template categories...");
	console.log(`DB URL found: ${process.env.DATABASE_URL.substring(0, 10)}...`);

	try {
		for (const category of DEFAULT_CATEGORIES) {
			await db.execute(sql`
				insert into ${categories} (name, type, user_id, is_archived, color)
				values (${category.name}, ${category.type}, null, false, ${category.color})
				on conflict (type, lower(name))
				where user_id is null and is_archived = false
				do nothing
			`);
		}

		console.log("Template categories seeded!");
		process.exit(0);
	} catch (err) {
		console.error("Seeding failed:", err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("Seeding failed:", err);
	process.exit(1);
});
