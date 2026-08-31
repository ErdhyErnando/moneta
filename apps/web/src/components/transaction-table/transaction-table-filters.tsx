import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
					<Label className="font-medium text-muted-foreground text-xs">
						Start Date
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn(
									"w-[140px] justify-start text-left font-normal",
									!startDate && "text-muted-foreground",
								)}
							>
								{startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={setStartDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						End Date
					</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn(
									"w-[140px] justify-start text-left font-normal",
									!endDate && "text-muted-foreground",
								)}
							>
								{endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={endDate}
								onSelect={setEndDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Category
					</Label>
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="h-8 w-40">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{categories.map((c) => (
								<SelectItem key={c.id} value={String(c.id)}>
									{c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Min Amount
					</Label>
					<Input
						type="number"
						placeholder="0"
						value={minAmount}
						onChange={(e) => setMinAmount(e.target.value)}
						className="h-8 w-[100px]"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Max Amount
					</Label>
					<Input
						type="number"
						placeholder="No limit"
						value={maxAmount}
						onChange={(e) => setMaxAmount(e.target.value)}
						className="h-8 w-[100px]"
					/>
				</div>
				{hasActiveFilters && <ClearButton onClick={clearFilters} />}
			</div>
		</div>
	);
}
