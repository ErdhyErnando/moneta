import { cn } from "@/lib/utils";

// Color palette for categories - using Tailwind color classes
const categoryColors = [
	{
		bg: "bg-blue-100",
		text: "text-blue-700",
		darkBg: "dark:bg-blue-900/30",
		darkText: "dark:text-blue-300",
	},
	{
		bg: "bg-green-100",
		text: "text-green-700",
		darkBg: "dark:bg-green-900/30",
		darkText: "dark:text-green-300",
	},
	{
		bg: "bg-purple-100",
		text: "text-purple-700",
		darkBg: "dark:bg-purple-900/30",
		darkText: "dark:text-purple-300",
	},
	{
		bg: "bg-orange-100",
		text: "text-orange-700",
		darkBg: "dark:bg-orange-900/30",
		darkText: "dark:text-orange-300",
	},
	{
		bg: "bg-pink-100",
		text: "text-pink-700",
		darkBg: "dark:bg-pink-900/30",
		darkText: "dark:text-pink-300",
	},
	{
		bg: "bg-cyan-100",
		text: "text-cyan-700",
		darkBg: "dark:bg-cyan-900/30",
		darkText: "dark:text-cyan-300",
	},
	{
		bg: "bg-yellow-100",
		text: "text-yellow-700",
		darkBg: "dark:bg-yellow-900/30",
		darkText: "dark:text-yellow-300",
	},
	{
		bg: "bg-indigo-100",
		text: "text-indigo-700",
		darkBg: "dark:bg-indigo-900/30",
		darkText: "dark:text-indigo-300",
	},
	{
		bg: "bg-rose-100",
		text: "text-rose-700",
		darkBg: "dark:bg-rose-900/30",
		darkText: "dark:text-rose-300",
	},
	{
		bg: "bg-teal-100",
		text: "text-teal-700",
		darkBg: "dark:bg-teal-900/30",
		darkText: "dark:text-teal-300",
	},
	{
		bg: "bg-amber-100",
		text: "text-amber-700",
		darkBg: "dark:bg-amber-900/30",
		darkText: "dark:text-amber-300",
	},
	{
		bg: "bg-emerald-100",
		text: "text-emerald-700",
		darkBg: "dark:bg-emerald-900/30",
		darkText: "dark:text-emerald-300",
	},
	{
		bg: "bg-violet-100",
		text: "text-violet-700",
		darkBg: "dark:bg-violet-900/30",
		darkText: "dark:text-violet-300",
	},
	{
		bg: "bg-fuchsia-100",
		text: "text-fuchsia-700",
		darkBg: "dark:bg-fuchsia-900/30",
		darkText: "dark:text-fuchsia-300",
	},
	{
		bg: "bg-lime-100",
		text: "text-lime-700",
		darkBg: "dark:bg-lime-900/30",
		darkText: "dark:text-lime-300",
	},
	{
		bg: "bg-sky-100",
		text: "text-sky-700",
		darkBg: "dark:bg-sky-900/30",
		darkText: "dark:text-sky-300",
	},
];

// Simple hash function to consistently assign colors based on category name
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

export function getCategoryColor(categoryName: string) {
	const hash = hashString(categoryName);
	return categoryColors[hash % categoryColors.length];
}

type CategoryBadgeProps = {
	name: string;
	className?: string;
};

export function CategoryBadge({ name, className }: CategoryBadgeProps) {
	const colors = getCategoryColor(name);

	return (
		<span
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-xs",
				colors.bg,
				colors.text,
				colors.darkBg,
				colors.darkText,
				className,
			)}
		>
			{name}
		</span>
	);
}
