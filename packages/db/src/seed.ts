import * as dotenv from "dotenv";

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
];

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined");
	}
	console.log("🌱 Seeding categories...");
	console.log(`DB URL found: ${process.env.DATABASE_URL.substring(0, 10)}...`);

	try {
		await db
			.insert(categories)
			.values(DEFAULT_CATEGORIES)
			.onConflictDoNothing();

		console.log("✅ Categories seeded!");
		process.exit(0);
	} catch (err) {
		console.error("❌ Seeding failed:", err);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error("❌ Seeding failed:", err);
	process.exit(1);
});
