ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "categories" ("name", "type", "user_id", "is_archived")
SELECT template."name", template."type", app_user."id", false
FROM "categories" template
CROSS JOIN "user" app_user
WHERE template."user_id" IS NULL
	AND template."is_archived" = false
	AND NOT EXISTS (
		SELECT 1
		FROM "categories" user_category
		WHERE user_category."user_id" = app_user."id"
			AND user_category."type" = template."type"
			AND lower(user_category."name") = lower(template."name")
	);--> statement-breakpoint
UPDATE "incomes" income
SET "category_id" = user_category."id"
FROM "categories" template, "categories" user_category
WHERE income."category_id" = template."id"
	AND user_category."user_id" = income."user_id"
	AND user_category."type" = template."type"
	AND lower(user_category."name") = lower(template."name")
	AND template."user_id" IS NULL;--> statement-breakpoint
UPDATE "expenses" expense
SET "category_id" = user_category."id"
FROM "categories" template, "categories" user_category
WHERE expense."category_id" = template."id"
	AND user_category."user_id" = expense."user_id"
	AND user_category."type" = template."type"
	AND lower(user_category."name") = lower(template."name")
	AND template."user_id" IS NULL;--> statement-breakpoint
UPDATE "starting_balances" starting_balance
SET "category_id" = user_category."id"
FROM "categories" template, "categories" user_category
WHERE starting_balance."category_id" = template."id"
	AND user_category."user_id" = starting_balance."user_id"
	AND user_category."type" = template."type"
	AND lower(user_category."name") = lower(template."name")
	AND template."user_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_active_name_type_unique" ON "categories" USING btree ("user_id","type",lower("name")) WHERE "categories"."user_id" is not null and "categories"."is_archived" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_template_active_name_type_unique" ON "categories" USING btree ("type",lower("name")) WHERE "categories"."user_id" is null and "categories"."is_archived" = false;