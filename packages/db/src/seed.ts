import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

// Try to load .env from root or apps/server
dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../../apps/server/.env" });

const { db } = await import(".");
const { categories } = await import("./schema/moneta");

const DEFAULT_CATEGORIES: (typeof categories.$inferInsert)[] = [
	{ name: "Salary", type: "income", color: "#2eb9c6" },
	{ name: "Freelance", type: "income", color: "#50abf8" },
	{ name: "Investments", type: "income", color: "#9c97f8" },
	{ name: "Gift", type: "income", color: "#b1641a" },
	{ name: "Other Income", type: "income", color: "#9e9791" },
	{ name: "Rent", type: "expense", color: "#c54c53" },
	{ name: "Groceries", type: "expense", color: "#a2af28" },
	{ name: "Utilities", type: "expense", color: "#4f74d5" },
	{ name: "Transportation", type: "expense", color: "#f47e57" },
	{ name: "Entertainment", type: "expense", color: "#b54f94" },
	{ name: "Healthcare", type: "expense", color: "#f1779f" },
	{ name: "Shopping", type: "expense", color: "#8f5fc4" },
	{ name: "Dining Out", type: "expense", color: "#d59728" },
	{ name: "Travel", type: "expense", color: "#d281dc" },
	{ name: "Education", type: "expense", color: "#8e791b" },
	{ name: "Other Expense", type: "expense", color: "#867f79" },
	{ name: "Savings", type: "starting_balance", color: "#1e83b8" },
	{ name: "Cash on Hand", type: "starting_balance", color: "#208c85" },
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
