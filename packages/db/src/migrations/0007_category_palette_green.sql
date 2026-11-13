-- #44 / docs/design.md §2.7 — green category palette.
--
-- Only rows whose colour is STILL the old shipped default (matched on name, type
-- and the exact old hex) are rewritten, so user-picked colours are never
-- overwritten. Safe to run twice.
--
-- Old hexes are the ones seeded by `DEFAULT_CATEGORIES` before this change:
--   income:   Salary #10b981 · Freelance #0ea5e9 · Investments #8b5cf6 · Gift #f59e0b · Other Income #06b6d4
--   expense:  Rent #ef4444 · Groceries #22c55e · Utilities #3b82f6 · Transportation #f97316
--             Entertainment #ec4899 · Healthcare #14b8a6 · Shopping #a855f7 · Dining Out #facc15
--             Travel #6366f1 · Education #84cc16 · Other Expense #71717a
--   starting: Savings #0ea5e9 · Cash on Hand #22c55e

UPDATE "categories" SET "color" = '#2eb9c6', "updated_at" = now()
  WHERE "name" = 'Salary' AND "type" = 'income' AND "color" = '#10b981';--> statement-breakpoint
UPDATE "categories" SET "color" = '#50abf8', "updated_at" = now()
  WHERE "name" = 'Freelance' AND "type" = 'income' AND "color" = '#0ea5e9';--> statement-breakpoint
UPDATE "categories" SET "color" = '#9c97f8', "updated_at" = now()
  WHERE "name" = 'Investments' AND "type" = 'income' AND "color" = '#8b5cf6';--> statement-breakpoint
UPDATE "categories" SET "color" = '#b1641a', "updated_at" = now()
  WHERE "name" = 'Gift' AND "type" = 'income' AND "color" = '#f59e0b';--> statement-breakpoint
UPDATE "categories" SET "color" = '#9e9791', "updated_at" = now()
  WHERE "name" = 'Other Income' AND "type" = 'income' AND "color" = '#06b6d4';--> statement-breakpoint
UPDATE "categories" SET "color" = '#c54c53', "updated_at" = now()
  WHERE "name" = 'Rent' AND "type" = 'expense' AND "color" = '#ef4444';--> statement-breakpoint
UPDATE "categories" SET "color" = '#a2af28', "updated_at" = now()
  WHERE "name" = 'Groceries' AND "type" = 'expense' AND "color" = '#22c55e';--> statement-breakpoint
UPDATE "categories" SET "color" = '#4f74d5', "updated_at" = now()
  WHERE "name" = 'Utilities' AND "type" = 'expense' AND "color" = '#3b82f6';--> statement-breakpoint
UPDATE "categories" SET "color" = '#f47e57', "updated_at" = now()
  WHERE "name" = 'Transportation' AND "type" = 'expense' AND "color" = '#f97316';--> statement-breakpoint
UPDATE "categories" SET "color" = '#b54f94', "updated_at" = now()
  WHERE "name" = 'Entertainment' AND "type" = 'expense' AND "color" = '#ec4899';--> statement-breakpoint
UPDATE "categories" SET "color" = '#f1779f', "updated_at" = now()
  WHERE "name" = 'Healthcare' AND "type" = 'expense' AND "color" = '#14b8a6';--> statement-breakpoint
UPDATE "categories" SET "color" = '#8f5fc4', "updated_at" = now()
  WHERE "name" = 'Shopping' AND "type" = 'expense' AND "color" = '#a855f7';--> statement-breakpoint
UPDATE "categories" SET "color" = '#d59728', "updated_at" = now()
  WHERE "name" = 'Dining Out' AND "type" = 'expense' AND "color" = '#facc15';--> statement-breakpoint
UPDATE "categories" SET "color" = '#d281dc', "updated_at" = now()
  WHERE "name" = 'Travel' AND "type" = 'expense' AND "color" = '#6366f1';--> statement-breakpoint
UPDATE "categories" SET "color" = '#8e791b', "updated_at" = now()
  WHERE "name" = 'Education' AND "type" = 'expense' AND "color" = '#84cc16';--> statement-breakpoint
UPDATE "categories" SET "color" = '#867f79', "updated_at" = now()
  WHERE "name" = 'Other Expense' AND "type" = 'expense' AND "color" = '#71717a';--> statement-breakpoint
UPDATE "categories" SET "color" = '#1e83b8', "updated_at" = now()
  WHERE "name" = 'Savings' AND "type" = 'starting_balance' AND "color" = '#0ea5e9';--> statement-breakpoint
UPDATE "categories" SET "color" = '#208c85', "updated_at" = now()
  WHERE "name" = 'Cash on Hand' AND "type" = 'starting_balance' AND "color" = '#22c55e';
