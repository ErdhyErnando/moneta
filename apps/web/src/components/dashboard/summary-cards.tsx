import { LayerCard } from "@cloudflare/kumo";
import {
	ArrowDownRightIcon,
	ArrowUpRightIcon,
	WalletIcon,
} from "@phosphor-icons/react";

export interface DashboardSummary {
	totalIncome: number;
	totalExpenses: number;
	netBalance: number;
	totalStartingBalance: number;
	currentBalance: number;
}

type SummaryCardsProps = {
	summary: DashboardSummary | undefined;
	isLoading: boolean;
	formatCurrency: (amount: number) => string;
};

type MetricCardProps = {
	label: string;
	icon: React.ReactNode;
	isLoading: boolean;
	value: React.ReactNode;
};

function MetricCard({
	label,
	icon,
	isLoading,
	value,
}: MetricCardProps): React.JSX.Element {
	return (
		<LayerCard className="gap-2 rounded-xl p-6 shadow-none">
			<div className="flex items-center justify-between">
				<span className="font-medium text-kumo-subtle text-sm">{label}</span>
				{icon}
			</div>
			{isLoading ? (
				<div className="h-8 w-32 animate-pulse rounded-lg bg-kumo-fill" />
			) : (
				value
			)}
		</LayerCard>
	);
}

// Summary cards row for the dashboard (#49).
export function SummaryCards({
	summary,
	isLoading,
	formatCurrency,
}: SummaryCardsProps): React.JSX.Element {
	const netBalance = summary?.netBalance || 0;
	const currentBalance = summary?.currentBalance || 0;

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<MetricCard
				label="Total Income"
				icon={<ArrowUpRightIcon className="text-positive" size={16} />}
				isLoading={isLoading}
				value={
					<div className="font-semibold text-2xl text-positive tabular-nums">
						+{formatCurrency(summary?.totalIncome || 0)}
					</div>
				}
			/>

			<MetricCard
				label="Total Expenses"
				icon={<ArrowDownRightIcon className="text-negative" size={16} />}
				isLoading={isLoading}
				value={
					<div className="font-semibold text-2xl text-negative tabular-nums">
						-{formatCurrency(summary?.totalExpenses || 0)}
					</div>
				}
			/>

			<MetricCard
				label="Net Balance"
				icon={<WalletIcon className="text-kumo-subtle" size={16} />}
				isLoading={isLoading}
				value={
					<div
						className={`font-semibold text-2xl tabular-nums ${
							netBalance >= 0 ? "text-positive" : "text-negative"
						}`}
					>
						{formatCurrency(netBalance)}
					</div>
				}
			/>

			<MetricCard
				label="Current Balance"
				icon={<WalletIcon className="text-kumo-subtle" size={16} />}
				isLoading={isLoading}
				value={
					<div className="font-semibold text-2xl text-kumo-default tabular-nums">
						{formatCurrency(currentBalance)}
					</div>
				}
			/>
		</div>
	);
}
