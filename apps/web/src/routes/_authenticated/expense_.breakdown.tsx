import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/expense_/breakdown")({
	component: ExpenseBreakdownPage,
});

function ExpenseBreakdownPage() {
	return (
		<div className="container mx-auto min-h-0 px-4 py-3 sm:px-6 sm:py-4">
			<div className="mb-3">
				<Button variant="ghost" asChild className="-ml-2 mb-2">
					<Link to="/expense">
						<ChevronLeft className="mr-2 h-4 w-4" />
						Back to Expenses
					</Link>
				</Button>
				<h1 className="font-bold text-2xl sm:text-3xl">Expense Breakdown</h1>
			</div>

			<CategoryBreakdownChart type="expense" />
		</div>
	);
}
