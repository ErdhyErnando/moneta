/**
 * Calendar-day convention (root cause of the #22/#32 month-bucketing drift):
 * transaction "date" values are pure calendar days, canonically stored at UTC
 * midnight. Incoming instants (e.g. legacy clients still sending *local*
 * midnight, which serializes as e.g. "2026-06-30T22:00:00.000Z" in UTC+2) are
 * rounded to the nearest UTC day so every write stores the intended day.
 */
export function nearestUtcDay(d: Date): Date {
	return new Date(Math.round(d.getTime() / 86_400_000) * 86_400_000);
}
