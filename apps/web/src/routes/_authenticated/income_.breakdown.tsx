import { buttonVariants } from "@cloudflare/kumo";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// recharts-heavy chart loads on demand per #48 (route-level code split)
const CategoryBreakdownChart = lazy(() =>
	import("@/components/category-breakdown-chart/category-breakdown-chart").then(
		(m) => ({ default: m.CategoryBreakdownChart }),
	),
);

export const Route = createFileRoute("/_authenticated/income_/breakdown")({
	component: IncomeBreakdownPage,
});

function IncomeBreakdownPage() {
	return (
		<div className="container mx-auto min-h-0 px-4 py-3 sm:px-6 sm:py-4">
			<div className="mb-3">
				<Link
					to="/income"
					className={`${buttonVariants({ variant: "ghost" })} -ml-2 mb-2`}
				>
					<CaretLeftIcon className="mr-2" size={16} />
					Back to Income
				</Link>
				<h1 className="font-bold text-2xl sm:text-3xl">Income Breakdown</h1>
			</div>

			<Suspense
				fallback={<div className="h-[300px] animate-pulse rounded bg-muted" />}
			>
				<CategoryBreakdownChart type="income" />
			</Suspense>
		</div>
	);
}
