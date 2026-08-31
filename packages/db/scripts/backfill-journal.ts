/**
 * One-off reconciliation for databases that were created with `db:push`
 * (the drizzle journal `drizzle.__drizzle_migrations` then only contains the
 * rows for migrations that happened to be run via `db:migrate`, so a plain
 * `db:migrate` would try to REPLAY already-present schema files and fail,
 * e.g. `column "issuer" of relation "account" already exists`).
 *
 * Drizzle's migrator is count-based: it applies journal entries at index >=
 * number of rows in the migrations table. This script backfills the missing
 * prefix rows with the same sha256-of-file-content hash + `when` timestamp
 * drizzle itself would have written, making future `db:migrate` runs safe.
 *
 * Usage (targets whatever DATABASE_URL points at; the server .env file is
 * only a fallback since dotenv never overrides existing env):
 *   DATABASE_URL=postgresql://... pnpm -F @moneta/db db:backfill-journal
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";

// must run BEFORE importing @moneta/db (module-level drizzle() reads env)
dotenv.config({
	path: join(import.meta.dirname, "..", "..", "..", "apps/server/.env"),
});

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL is not set (export it or create apps/server/.env)",
	);
}

const { db } = await import("../src/index");

const MIGRATIONS_DIR = join(import.meta.dirname, "..", "src", "migrations");

type Journal = {
	entries: { idx: number; when: number; tag: string }[];
};

async function main() {
	const journal = JSON.parse(
		readFileSync(join(MIGRATIONS_DIR, "meta", "_journal.json"), "utf8"),
	) as Journal;

	// fresh push-only DB: drizzle.migrate() creates this table itself, mirror it
	await db.execute(sql`create schema if not exists "drizzle"`);
	await db.execute(
		sql`create table if not exists drizzle.__drizzle_migrations (
			id serial primary key,
			hash text not null,
			created_at bigint
		)`,
	);

	const res = (await db.execute(
		sql`select count(*)::int as c from drizzle.__drizzle_migrations`,
	)) as unknown as { rows: { c: number }[] };
	const applied = res.rows[0]?.c ?? 0;

	const missing = journal.entries.slice(applied);
	if (missing.length === 0) {
		console.log(
			`journal already current (${applied}/${journal.entries.length} applied)`,
		);
		return;
	}

	console.log(
		`backfilling ${missing.length} migration row(s) (${applied} recorded, ${journal.entries.length} in journal):`,
	);
	for (const entry of missing) {
		const content = readFileSync(
			join(MIGRATIONS_DIR, `${entry.tag}.sql`),
			"utf8",
		);
		const hash = createHash("sha256").update(content).digest("hex");
		await db.execute(
			sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${entry.when})`,
		);
		console.log(`  + ${entry.tag} (hash ${hash.slice(0, 12)}…)`);
	}
	console.log("done — `pnpm db:migrate` is now safe for future migrations");
}

main()
	.catch((e) => {
		console.error(e);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
