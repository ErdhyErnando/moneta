"use client";

import { useQuery } from "@tanstack/react-query";
import {
    addMonths,
    addWeeks,
    addYears,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subMonths,
    subWeeks,
    subYears,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";

type Period = "weekly" | "monthly" | "yearly";

interface CategoryBreakdownChartProps {
    type: "income" | "expense";
}

interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    fill: string;
}

interface CategoriesResponse {
    categories: Array<{
        name: string;
        amount: string;
        percentage: number;
    }>;
}

const EXPENSE_CHART_COLORS = [
    "oklch(0.6368 0.2078 25.3313)", // Original Destructive
    "oklch(0.65 0.2 45)",           // Orange
    "oklch(0.7 0.15 70)",           // Amber
    "oklch(0.6 0.2 15)",            // Rose
    "oklch(0.55 0.18 35)",          // Burnt Orange
    "oklch(0.5 0.2 25)",            // Maroon
];

const INCOME_CHART_COLORS = [
    "oklch(0.68 0.18 160)",         // Emerald
    "oklch(0.65 0.15 190)",         // Teal
    "oklch(0.6 0.18 220)",          // Cyan
    "oklch(0.55 0.2 250)",          // Blue
    "oklch(0.62 0.16 280)",         // Indigo
    "oklch(0.7 0.12 140)",          // Light Green
];

export function CategoryBreakdownChart({ type }: CategoryBreakdownChartProps) {
    const { formatCurrency } = useCurrency();
    const [period, setPeriod] = useState<Period>("monthly");
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDateRange = () => {
        switch (period) {
            case "weekly":
                return {
                    start: startOfWeek(currentDate),
                    end: endOfWeek(currentDate),
                };
            case "yearly":
                return {
                    start: startOfYear(currentDate),
                    end: endOfYear(currentDate),
                };
            case "monthly":
            default:
                return {
                    start: startOfMonth(currentDate),
                    end: endOfMonth(currentDate),
                };
        }
    };

    const { start, end } = getDateRange();

    const { data, isLoading } = useQuery({
        queryKey: [`${type}-categories-breakdown`, period, start, end],
        queryFn: async () => {
            const res = await api.get<CategoriesResponse>(
                `/api/dashboard/${type}-categories`,
                {
                    params: {
                        startDate: format(start, "yyyy-MM-dd"),
                        endDate: format(end, "yyyy-MM-dd"),
                    },
                },
            );
            return res.data;
        },
    });

    const navigatePeriod = (direction: "prev" | "next") => {
        const amount = direction === "prev" ? -1 : 1;
        switch (period) {
            case "weekly":
                setCurrentDate(
                    amount === -1 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1),
                );
                break;
            case "monthly":
                setCurrentDate(
                    amount === -1 ? subMonths(currentDate, 1) : addMonths(currentDate, 1),
                );
                break;
            case "yearly":
                setCurrentDate(
                    amount === -1 ? subYears(currentDate, 1) : addYears(currentDate, 1),
                );
                break;
        }
    };

    const chartColors =
        type === "expense" ? EXPENSE_CHART_COLORS : INCOME_CHART_COLORS;

    const chartData: CategoryData[] = (data?.categories || [])
        .map((cat, index) => ({
            name: cat.name,
            amount: Number(cat.amount),
            percentage: cat.percentage,
            fill: chartColors[index % chartColors.length],
        }))
        .sort((a, b) => b.amount - a.amount);

    const chartConfig: ChartConfig = chartData.reduce(
        (config, item) => {
            config[item.name] = {
                label: item.name,
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

    const getHeaderText = () => {
        switch (period) {
            case "weekly":
                return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
            case "yearly":
                return format(currentDate, "yyyy");
            case "monthly":
            default:
                return format(currentDate, "MMMM yyyy");
        }
    };

    const total = chartData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="capitalize">
                            {type} Breakdown by Category
                        </CardTitle>
                        <CardDescription>
                            Visualize your {type} across different categories
                        </CardDescription>
                    </div>
                    <Tabs
                        value={period}
                        onValueChange={(v) => {
                            setPeriod(v as Period);
                            setCurrentDate(new Date());
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigatePeriod("prev")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-semibold text-lg">{getHeaderText()}</h3>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigatePeriod("next")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                        No {type} data found for this period
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{
                                right: 32,
                                left: 32,
                                top: 8,
                                bottom: 8,
                            }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                hide
                            />
                            <XAxis dataKey="amount" type="number" hide />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                }
                            />
                            <Bar
                                dataKey="amount"
                                layout="vertical"
                                fill="var(--color-amount)"
                                radius={4}
                            >
                                <LabelList
                                    dataKey="name"
                                    position="insideLeft"
                                    offset={12}
                                    className="fill-background font-medium"
                                    fontSize={12}
                                />
                                <LabelList
                                    dataKey="amount"
                                    position="right"
                                    offset={12}
                                    className="fill-foreground font-semibold"
                                    fontSize={12}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}

                {!isLoading && chartData.length > 0 && (
                    <div className="mt-6 border-t pt-4 text-center">
                        <p className="text-muted-foreground text-sm">
                            Total {type}:{" "}
                            <span className="font-bold text-foreground">
                                {formatCurrency(total)}
                            </span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
