CREATE TYPE "public"."asset_type" AS ENUM('stock', 'bond', 'cash', 'crypto', 'other');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"name" text NOT NULL,
	"symbol" text,
	"quantity" numeric(18, 8),
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_user_type_idx" ON "assets" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "assets_user_date_idx" ON "assets" USING btree ("user_id","date");