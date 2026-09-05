import { MonthlyBarChart } from "@/components/monthly-bar-chart";

interface ChartBarMonthlyExpensesProps {
	onToggle?: () => void;
}

export function ChartBarMonthlyExpenses({
	onToggle,
}: ChartBarMonthlyExpensesProps) {
	return (
		<MonthlyBarChart
			title="Monthly Expenses"
			descriptionPrefix="Expenses by month"
			queryKeyBase="monthly-expenses"
			endpoint={(year) => `/api/dashboard/monthly-expenses?year=${year}`}
			barLabel="Expenses"
			barColor="var(--destructive)"
			toggleTitle="Switch to Income"
			onToggle={onToggle}
		/>
	);
}
