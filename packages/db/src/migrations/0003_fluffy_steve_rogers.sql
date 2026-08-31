UPDATE "account" SET "issuer" = 'local:credential' WHERE "provider_id" = 'credential' AND ("issuer" IS NULL OR "issuer" = '');--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_idx" ON "account" USING btree ("issuer","account_id");