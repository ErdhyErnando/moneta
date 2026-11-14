import { buttonVariants } from "@cloudflare/kumo";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ChartCard } from "@/components/charts/chart-card";
import { PageContainer, PageHeader } from "@/components/layout";
import { cn } from "@/lib/utils";

// recharts-heavy chart loads on demand per #48 (route-level code split)
const CategoryBreakdownChart = lazy(() =>
	import("@/components/category-breakdown-chart/category-breakdown-chart").then(
		(m) => ({ default: m.CategoryBreakdownChart }),
	),
);

export const Route = createFileRoute("/_authenticated/expense_/breakdown")({
	component: ExpenseBreakdownPage,
});

function ExpenseBreakdownPage(): React.JSX.Element {
	return (
		<PageContainer>
			<PageHeader
				title="Expense Breakdown"
				description="Expenses by category, for the period you pick."
				actions={
					<Link
						to="/expense"
						className={cn(
							buttonVariants({ variant: "secondary" }),
							"max-md:h-11",
						)}
					>
						<CaretLeftIcon className="mr-2" size={16} />
						Back to Expenses
					</Link>
				}
			/>

			<Suspense
				fallback={
					<ChartCard
						title="By category"
						description="Where the money went, per category."
						height="auto"
						isLoading
					/>
				}
			>
				<CategoryBreakdownChart type="expense" />
			</Suspense>
		</PageContainer>
	);
}
