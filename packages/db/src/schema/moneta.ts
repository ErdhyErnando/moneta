import { relations } from "drizzle-orm";
import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"]);

export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	type: categoryTypeEnum("type").notNull(),
});

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

export const categoriesRelations = relations(categories, ({ many }) => ({
	incomes: many(incomes),
	expenses: many(expenses),
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
