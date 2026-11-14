/**
 * Shape of one row from `GET /api/dashboard/transactions`.
 *
 * The dashboard endpoint flattens the category onto the row and keeps the sign
 * in `type` — unlike `transaction-table`'s nested shape, which is the ledger's
 * own `/api/expenses` + `/api/incomes` payload.
 */
export type DashboardTransaction = {
	id: number;
	/** ISO string, UTC */
	date: string;
	description: string;
	category: string;
	categoryColor?: string;
	amount: number;
	type: "income" | "expense";
};
