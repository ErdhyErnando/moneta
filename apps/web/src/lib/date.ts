/**
 * Canonical date handling (root-cause fix behind the #22 breakdown/dashboard
 * month mismatch, also visible in the #32 monthly accordion).
 *
 * A transaction's "date" is a pure calendar day. Historically the forms sent
 * the picked day at *local midnight*, which JSON serializes as a shifted UTC
 * instant (e.g. Jul 1 in UTC+2 → "2026-06-30T22:00:00.000Z"), so UTC-based
 * month bucketing (dashboard DATE_TRUNC, monthly accordion) landed on the
 * previous month for month-boundary entries.
 *
 * Convention now:
 * - writes: `toUtcDayIso(pickedDate)` → "YYYY-MM-DDT00:00:00.000Z" of the
 *   picked local calendar day
 * - server schemas additionally round incoming instants to the nearest UTC day
 * - range filters go out as date-only "YYYY-MM-DD" strings (dashboard.ts and
 *   mutations.ts normalize those to UTC day boundaries)
 * - reads/formatting: `asUtcDay(value)` + `utcDayString(value)` render the
 *   UTC calendar day regardless of browser timezone
 * - migration 0005 normalizes pre-existing rows
 */

/** UTC-midnight ISO string for the local calendar day of `d`. */
export function toUtcDayIso(d: Date): string {
	return new Date(
		Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
	).toISOString();
}

/** Date-only "YYYY-MM-DD" for the local calendar day of `d`. */
export function utcDayString(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/**
 * Local Date whose wall-clock parts equal the UTC calendar day of `value`.
 * Format this (not the raw parsed instant) so a day stored as UTC midnight
 * renders as the intended day in every browser timezone.
 */
export function asUtcDay(value: string | Date): Date {
	const d = typeof value === "string" ? new Date(value) : value;
	return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
