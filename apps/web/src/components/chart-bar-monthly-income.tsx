import { MonthlyBarChart } from "@/components/monthly-bar-chart";

interface ChartBarMonthlyIncomeProps {
	onToggle?: () => void;
}

export function ChartBarMonthlyIncome({
	onToggle,
}: ChartBarMonthlyIncomeProps) {
	return (
		<MonthlyBarChart
			title="Monthly Income"
			descriptionPrefix="Income by month"
			queryKeyBase="monthly-income"
			endpoint={(year) => `/api/dashboard/monthly-income?year=${year}`}
			barLabel="Income"
			barColor="var(--color-positive)"
			toggleTitle="Switch to Expenses"
			onToggle={onToggle}
		/>
	);
}
