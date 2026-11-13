import { Button, Input, Label, Select } from "@cloudflare/kumo";
import { Popover } from "@cloudflare/kumo/components/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
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
}: Props) {
	return (
		<div className="rounded-lg border bg-muted/50 p-4">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						Start Date
					</Label>
					<Popover.Root>
						<Popover.Trigger
							render={
								<Button
									variant="secondary"
									size="sm"
									className={cn(
										"w-[140px] justify-start text-left",
										!startDate && "text-kumo-subtle",
									)}
								/>
							}
						>
							{startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Positioner align="start">
								<Popover.Popup className="w-auto p-0">
									<Calendar
										mode="single"
										selected={startDate}
										onSelect={setStartDate}
										initialFocus
									/>
								</Popover.Popup>
							</Popover.Positioner>
						</Popover.Portal>
					</Popover.Root>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						End Date
					</Label>
					<Popover.Root>
						<Popover.Trigger
							render={
								<Button
									variant="secondary"
									size="sm"
									className={cn(
										"w-[140px] justify-start text-left",
										!endDate && "text-kumo-subtle",
									)}
								/>
							}
						>
							{endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Positioner align="start">
								<Popover.Popup className="w-auto p-0">
									<Calendar
										mode="single"
										selected={endDate}
										onSelect={setEndDate}
										initialFocus
									/>
								</Popover.Popup>
							</Popover.Positioner>
						</Popover.Portal>
					</Popover.Root>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-kumo-subtle text-xs">
						Category
					</Label>
					<Select
						size="sm"
						className="w-40"
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
						className="w-[100px]"
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
						className="w-[100px]"
					/>
				</div>
				{hasActiveFilters && <ClearButton onClick={clearFilters} />}
			</div>
		</div>
	);
}
