import { db } from "@moneta/db";
import { categories } from "@moneta/db/schema/moneta";
import { and, eq, sql } from "drizzle-orm";

export type CategoryType = "income" | "expense" | "starting_balance";

export async function ensureUserDefaultCategories(
	userId: string,
): Promise<void> {
	await db.execute(sql`
		insert into ${categories} (name, type, user_id, is_archived, color)
		select template.name, template.type, ${userId}, false, template.color
		from ${categories} template
		where template.user_id is null
			and template.is_archived = false
			and not exists (
				select 1
				from ${categories} user_category
				where user_category.user_id = ${userId}
					and user_category.type = template.type
					and lower(user_category.name) = lower(template.name)
			)
	`);
}

export async function getActiveUserCategory(
	userId: string,
	categoryId: number,
	type: CategoryType,
): Promise<typeof categories.$inferSelect | undefined> {
	return db.query.categories.findFirst({
		where: and(
			eq(categories.id, categoryId),
			eq(categories.userId, userId),
			eq(categories.type, type),
			eq(categories.isArchived, false),
		),
	});
}

export async function isActiveUserCategory(
	userId: string,
	categoryId: number,
	type: CategoryType,
): Promise<boolean> {
	const category = await getActiveUserCategory(userId, categoryId, type);
	return Boolean(category);
}

export async function hasActiveUserCategoryName(
	userId: string,
	name: string,
	type: CategoryType,
	excludedCategoryId?: number,
): Promise<boolean> {
	const rows = await db
		.select({ id: categories.id })
		.from(categories)
		.where(
			and(
				eq(categories.userId, userId),
				eq(categories.type, type),
				eq(categories.isArchived, false),
				sql`lower(${categories.name}) = lower(${name})`,
				excludedCategoryId
					? sql`${categories.id} <> ${excludedCategoryId}`
					: sql`true`,
			),
		)
		.limit(1);

	return rows.length > 0;
}
