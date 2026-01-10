import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/income_/breakdown")({
    component: IncomeBreakdownPage,
});

function IncomeBreakdownPage() {
    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
            <div className="mb-6">
                <Button variant="ghost" asChild className="-ml-2 mb-4">
                    <Link to="/income">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Income
                    </Link>
                </Button>
                <h1 className="font-bold text-2xl sm:text-3xl">Income Breakdown</h1>
            </div>

            <CategoryBreakdownChart type="income" />
        </div>
    );
}
