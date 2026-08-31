import type { Row } from "@tanstack/react-table";

// Module-scope static per #25/#27
const MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

// Pagination model for #32: months (groups) are paginated, never split.
export const MONTHS_PER_PAGE = 6;

export type MonthlyGroup<T> = {
	/** UTC month key `YYYY-MM` — matches DATE_TRUNC('month', date AT TIME ZONE 'UTC') from #22 */
	key: string;
	label: string;
	total: number;
	rows: Row<T>[];
};

/**
 * Groups TanStack rows by UTC month (`date.slice(0, 7)` on the serialized ISO
 * date), newest month first — consistent with dashboard.ts:getMonthlyData (#22).
 * Totals are the raw `amount` sums (sign is applied by the renderer per type).
 */
export function groupRowsByUtcMonth<T extends { date: string; amount: string }>(
	rows: Row<T>[],
): MonthlyGroup<T>[] {
	const map = new Map<string, MonthlyGroup<T>>();
	for (const row of rows) {
		const key = row.original.date.slice(0, 7);
		let group = map.get(key);
		if (!group) {
			const monthIndex = Number(key.slice(5, 7)) - 1;
			group = {
				key,
				label: `${MONTH_NAMES[monthIndex] ?? key} ${key.slice(0, 4)}`,
				total: 0,
				rows: [],
			};
			map.set(key, group);
		}
		group.total += Number(row.original.amount);
		group.rows.push(row);
	}
	return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
}
