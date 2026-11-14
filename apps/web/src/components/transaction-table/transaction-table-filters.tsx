import { Input, Label, Select } from "@cloudflare/kumo";
import { DateFilterField } from "@/components/date-picker";
import { ClearButton } from "./transaction-table-toolbar";

type Category = { id: number; name: string };

type Props = {
	startDate?: Date;
	setStartDate: (d?: Date) => void;
	endDate?: Date;
	setEndDate: (d?: Date) => void;
	selectedCategory: string;
	setSelectedCategory: (v: string) => void;
	minAmount: string;
	setMinAmount: (v: string) => void;
	maxAmount: string;
	setMaxAmount: (v: string) => void;
	categories: Category[];
	hasActiveFilters: boolean;
	clearFilters: () => void;
};

/** Inset filter panel (docs/design.md §7.2: `rounded-lg bg-kumo-recessed`). */
export function TransactionTableFilters({
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
	hasActiveFilters,
	clearFilters,
}: Props): React.JSX.Element {
	return (
		<div className="rounded-lg bg-kumo-recessed p-4">
			<div className="flex flex-wrap items-end gap-4">
				<DateFilterField
					label="Start Date"
					value={startDate}
					onSelect={setStartDate}
					className="w-36"
				/>
				<DateFilterField
					label="End Date"
					value={endDate}
					onSelect={setEndDate}
					className="w-36"
				/>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						Category
					</Label>
					<Select
						size="sm"
						className="w-40 max-md:h-11"
						aria-label="Category"
						value={selectedCategory}
						onValueChange={(value) => setSelectedCategory(value ?? "all")}
						items={[
							{ label: "All categories", value: "all" },
							...categories.map((c) => ({
								label: c.name,
								value: String(c.id),
							})),
						]}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						Min Amount
					</Label>
					<Input
						type="number"
						size="sm"
						aria-label="Min amount"
						placeholder="0"
						value={minAmount}
						onChange={(e) => setMinAmount(e.target.value)}
						className="w-25 max-md:h-11"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						Max Amount
					</Label>
					<Input
						type="number"
						size="sm"
						aria-label="Max amount"
						placeholder="No limit"
						value={maxAmount}
						onChange={(e) => setMaxAmount(e.target.value)}
						className="w-25 max-md:h-11"
					/>
				</div>
				{hasActiveFilters && <ClearButton onClick={clearFilters} />}
			</div>
		</div>
	);
}
