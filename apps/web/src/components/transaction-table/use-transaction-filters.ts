import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { api } from "@/lib/api";

type Category = {
	id: number;
	name: string;
	type: "income" | "expense";
	color: string;
};

// Module-scope helpers per #27 (prefer-module-scope-pure-function)
const getStartOfDay = (date: Date): number =>
	new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		0,
		0,
		0,
		0,
	).getTime();

const getEndOfDay = (date: Date): number =>
	new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		23,
		59,
		59,
		999,
	).getTime();

export function useTransactionFilters<
	T extends { date: string; categoryId: number; amount: string },
>(data: T[], type: "income" | "expense") {
	const [showFilters, setShowFilters] = React.useState(false);
	const [startDate, setStartDate] = React.useState<Date | undefined>();
	const [endDate, setEndDate] = React.useState<Date | undefined>();
	const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
	const [minAmount, setMinAmount] = React.useState<string>("");
	const [maxAmount, setMaxAmount] = React.useState<string>("");

	const { data: categories = [] } = useQuery({
		queryKey: ["categories", type],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
			return res.data.categories.filter((c) => c.type === type);
		},
	});

	const filteredData = React.useMemo(() => {
		return data.filter((transaction) => {
			const transactionTimestamp = new Date(transaction.date).getTime();
			if (startDate && transactionTimestamp < getStartOfDay(startDate))
				return false;
			if (endDate && transactionTimestamp > getEndOfDay(endDate)) return false;
			if (selectedCategory && selectedCategory !== "all") {
				if (transaction.categoryId !== Number(selectedCategory)) return false;
			}
			const amount = Number(transaction.amount);
			if (Number.isNaN(amount)) return false;
			if (minAmount) {
				const min = Number(minAmount);
				if (!Number.isNaN(min) && amount < min) return false;
			}
			if (maxAmount) {
				const max = Number(maxAmount);
				if (!Number.isNaN(max) && amount > max) return false;
			}
			return true;
		});
	}, [data, startDate, endDate, selectedCategory, minAmount, maxAmount]);

	const clearFilters = () => {
		setStartDate(undefined);
		setEndDate(undefined);
		setSelectedCategory("all");
		setMinAmount("");
		setMaxAmount("");
	};

	const hasActiveFilters =
		!!startDate ||
		!!endDate ||
		(selectedCategory && selectedCategory !== "all") ||
		!!minAmount ||
		!!maxAmount;

	return {
		showFilters,
		setShowFilters,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		selectedCategory,
		setSelectedCategory,
		minAmount,
		setMinAmount,
		maxAmount,
		setMaxAmount,
		categories,
		filteredData,
		clearFilters,
		hasActiveFilters,
	};
}
