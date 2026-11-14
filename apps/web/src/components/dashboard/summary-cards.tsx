import { Banner, LayerCard } from "@cloudflare/kumo";
import { ArrowClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type * as React from "react";
import { SignedAmount } from "@/components/dashboard/signed-amount";
import { cn } from "@/lib/utils";

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
	isError?: boolean;
	onRetry?: () => void;
	formatCurrency: (amount: number) => string;
};

type MetricCardProps = {
	label: string;
	isLoading: boolean;
	value: React.ReactNode;
};

function MetricCard({
	label,
	isLoading,
	value,
}: MetricCardProps): React.JSX.Element {
	return (
		<LayerCard className="flex flex-col gap-2 rounded-xl p-6 shadow-none">
			<span className="font-medium text-kumo-subtle text-sm">{label}</span>
			{isLoading ? (
				<div className="h-8 w-32 animate-pulse rounded-lg bg-kumo-fill" />
			) : (
				value
			)}
		</LayerCard>
	);
}

/** Money always carries `tabular-nums`; brand never colours a number (§2.2). */
const MONEY = "font-semibold text-2xl text-kumo-default tabular-nums";

/**
 * The four headline figures (docs/design.md §2.4, §13). Income, expenses and the
 * net use the positive/negative tokens; the current balance stays neutral because
 * it is a balance, not a flow.
 */
export function SummaryCards({
	summary,
	isLoading,
	isError = false,
	onRetry,
	formatCurrency,
}: SummaryCardsProps): React.JSX.Element {
	const totalIncome = summary?.totalIncome ?? 0;
	const totalExpenses = summary?.totalExpenses ?? 0;
	const netBalance = summary?.netBalance ?? 0;
	const currentBalance = summary?.currentBalance ?? 0;
	const netDirection =
		netBalance === 0 ? undefined : netBalance > 0 ? "positive" : "negative";

	if (isError) {
		return (
			<Banner
				variant="error"
				icon={<WarningCircleIcon size={16} />}
				title="Could not load your summary"
				description="The totals for this period did not load."
				action={
					onRetry ? (
						<Banner.Action
							variant="secondary"
							icon={<ArrowClockwiseIcon size={16} />}
							onClick={onRetry}
						>
							Retry
						</Banner.Action>
					) : undefined
				}
			/>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<MetricCard
				label="Total Income"
				isLoading={isLoading}
				value={
					<SignedAmount
						amount={totalIncome}
						formatCurrency={formatCurrency}
						direction="positive"
					/>
				}
			/>

			<MetricCard
				label="Total Expenses"
				isLoading={isLoading}
				value={
					<SignedAmount
						amount={totalExpenses}
						formatCurrency={formatCurrency}
						direction="negative"
					/>
				}
			/>

			<MetricCard
				label="Net Balance"
				isLoading={isLoading}
				value={
					netDirection ? (
						<SignedAmount
							amount={netBalance}
							formatCurrency={formatCurrency}
							direction={netDirection}
						/>
					) : (
						<div className={MONEY}>{formatCurrency(netBalance)}</div>
					)
				}
			/>

			<MetricCard
				label="Current Balance"
				isLoading={isLoading}
				value={
					<div className={cn(MONEY)}>{formatCurrency(currentBalance)}</div>
				}
			/>
		</div>
	);
}
