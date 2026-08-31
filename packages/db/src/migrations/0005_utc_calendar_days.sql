-- Normalize legacy transaction dates to UTC calendar days (root cause of the
-- #22/#32 month-bucket drift: forms used to send local midnight, stored as a
-- shifted UTC instant, e.g. Jul 1 (UTC+2) landed on Jun 30 22:00).
-- Owner's timezone (data fingerprint: Jun 30 22:00 = Jul 1 CEST midnight,
-- Feb 28 23:00 = Mar 1 CET midnight). Idempotent for already-normalized rows.
UPDATE "expenses" SET "date" = date_trunc('day', ("date" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Amsterdam');--> statement-breakpoint
UPDATE "incomes" SET "date" = date_trunc('day', ("date" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Amsterdam');--> statement-breakpoint
UPDATE "starting_balances" SET "date" = date_trunc('day', ("date" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Amsterdam');
