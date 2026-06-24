import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";

// Try to load .env from root or apps/server
dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../../apps/server/.env" });

const { db } = await import(".");
const { categories } = await import("./schema/moneta");

const DEFAULT_CATEGORIES: (typeof categories.$inferInsert)[] = [
	{ name: "Salary", type: "income" },
	{ name: "Freelance", type: "income" },
	{ name: "Investments", type: "income" },
	{ name: "Gift", type: "income" },
	{ name: "Other Income", type: "income" },
	{ name: "Rent", type: "expense" },
	{ name: "Groceries", type: "expense" },
	{ name: "Utilities", type: "expense" },
	{ name: "Transportation", type: "expense" },
	{ name: "Entertainment", type: "expense" },
	{ name: "Healthcare", type: "expense" },
	{ name: "Shopping", type: "expense" },
	{ name: "Dining Out", type: "expense" },
	{ name: "Travel", type: "expense" },
	{ name: "Education", type: "expense" },
	{ name: "Other Expense", type: "expense" },
	{ name: "Savings", type: "starting_balance" },
	{ name: "Cash on Hand", type: "starting_balance" },
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
				insert into ${categories} (name, type, user_id, is_archived)
				values (${category.name}, ${category.type}, null, false)
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
