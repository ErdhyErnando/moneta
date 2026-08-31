import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const categoryTypeEnum = pgEnum("category_type", [
	"income",
	"expense",
	"starting_balance",
]);

export const categories = pgTable(
	"categories",
	{
		id: serial("id").primaryKey(),
		name: text("name").notNull(),
		type: categoryTypeEnum("type").notNull(),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		isArchived: boolean("is_archived").default(false).notNull(),
		color: text("color").notNull().default("#71717a"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("categories_user_active_name_type_unique")
			.on(table.userId, table.type, sql`lower(${table.name})`)
			.where(sql`${table.userId} is not null and ${table.isArchived} = false`),
		uniqueIndex("categories_template_active_name_type_unique")
			.on(table.type, sql`lower(${table.name})`)
			.where(sql`${table.userId} is null and ${table.isArchived} = false`),
	],
);

export const incomes = pgTable("incomes", {
	id: serial("id").primaryKey(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const assetTypeEnum = pgEnum("asset_type", [
	"stock",
	"bond",
	"cash",
	"crypto",
	"other",
]);

export const assets = pgTable(
	"assets",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: assetTypeEnum("type").notNull(),
		name: text("name").notNull(),
		symbol: text("symbol"),
		quantity: numeric("quantity", { precision: 18, scale: 8 }),
		amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
		date: timestamp("date").notNull(),
		notes: text("notes"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("assets_user_type_idx").on(table.userId, table.type),
		index("assets_user_date_idx").on(table.userId, table.date),
	],
);

export const startingBalances = pgTable("starting_balances", {
	id: serial("id").primaryKey(),
	amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
	description: text("description"),
	date: timestamp("date").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	categoryId: integer("category_id")
		.notNull()
		.references(() => categories.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const categoriesRelations = relations(categories, ({ many, one }) => ({
	user: one(user, {
		fields: [categories.userId],
		references: [user.id],
	}),
	incomes: many(incomes),
	expenses: many(expenses),
	startingBalances: many(startingBalances),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
	user: one(user, {
		fields: [incomes.userId],
		references: [user.id],
	}),
	category: one(categories, {
		fields: [incomes.categoryId],
		references: [categories.id],
	}),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	user: one(user, {
		fields: [expenses.userId],
		references: [user.id],
	}),
	category: one(categories, {
		fields: [expenses.categoryId],
		references: [categories.id],
	}),
}));

export const startingBalancesRelations = relations(
	startingBalances,
	({ one }) => ({
		user: one(user, {
			fields: [startingBalances.userId],
			references: [user.id],
		}),
		category: one(categories, {
			fields: [startingBalances.categoryId],
			references: [categories.id],
		}),
	}),
);

export const assetsRelations = relations(assets, ({ one }) => ({
	user: one(user, {
		fields: [assets.userId],
		references: [user.id],
	}),
}));
