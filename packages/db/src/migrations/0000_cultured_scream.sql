-- Add 'starting_balance' to existing category_type enum
ALTER TYPE "public"."category_type" ADD VALUE IF NOT EXISTS 'starting_balance';-->statement-breakpoint

-- Create starting_balances table
CREATE TABLE IF NOT EXISTS "starting_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);-->statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "starting_balances" ADD CONSTRAINT "starting_balances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;-->statement-breakpoint
ALTER TABLE "starting_balances" ADD CONSTRAINT "starting_balances_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;