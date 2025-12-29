"use client";

import { useQuery } from "@tanstack/react-query";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

interface ChartPieExpenseCategoriesProps {
  startDate?: string;
  endDate?: string;
}

interface ExpenseCategoryData {
  category: string;
  amount: number;
  percentage: number;
  fill: string;
}

interface ExpenseCategoriesResponse {
  categories: Array<{
    name: string;
    amount: string;
    percentage: number;
  }>;
}

const CHART_COLORS = [
  "var(--destructive)",
  "var(--chart-2)",
  "var(--sidebar-foreground)",
  "var(--sidebar)",
  "var(--sidebar-primary)",
  "var(--chart-6)",
  "var(--foreground)",
  "var(--chart-8)",
];

export function ChartPieExpenseCategories({
  startDate,
  endDate,
}: ChartPieExpenseCategoriesProps) {
  const { formatCurrency } = useCurrency();

  const { data, isLoading } = useQuery({
    queryKey: ["expense-categories", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get<ExpenseCategoriesResponse>(
        `/api/dashboard/expense-categories?${params.toString()}`,
      );
      return response.data;
    },
  });

  // Transform data for the chart
  const chartData: ExpenseCategoryData[] =
    data?.categories.map((cat, index) => ({
      category: cat.name,
      amount: Number(cat.amount),
      percentage: cat.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    })) || [];

  // Build chart config dynamically
  const chartConfig: ChartConfig = chartData.reduce(
    (config, item) => {
      config[item.category] = {
        label: item.category,
        color: item.fill,
      };
      return config;
    },
    {
      amount: {
        label: "Amount",
      },
    } as ChartConfig,
  );

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>Breakdown by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground">
            No expense data available
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[280px] w-full"
            >
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{name}:</span>
                          <span className="font-bold">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="category"
                  fill="#8884d8"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius="85%"
                  labelLine
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-sm">
                Total Expenses: {formatCurrency(totalExpenses)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
