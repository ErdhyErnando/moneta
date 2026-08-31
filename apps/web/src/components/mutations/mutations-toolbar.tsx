import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { MutationsSearch } from "@/lib/mutations";
import { MutationsDateField } from "./mutations-date-field";
import { useDebouncedField } from "./use-debounced-field";

type Category = { id: number; name: string; type: string };

type Props = {
	search: MutationsSearch;
	onCommit: (patch: Partial<MutationsSearch>) => void;
};

function parseAmount(raw: string): number | undefined {
	if (!raw) return undefined;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** All state lives in the URL search params (#33 shareable filters). */
export function MutationsToolbar({ search, onCommit }: Props) {
	const [qInput, setQInput] = useDebouncedField(search.q, (q) =>
		onCommit({ q }),
	);
	const [minInput, setMinInput] = useDebouncedField(
		search.min === undefined ? "" : String(search.min),
		(raw) => onCommit({ min: parseAmount(raw) }),
	);
	const [maxInput, setMaxInput] = useDebouncedField(
		search.max === undefined ? "" : String(search.max),
		(raw) => onCommit({ max: parseAmount(raw) }),
	);
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
			return res.data.categories;
		},
	});
	const visibleCategories =
		search.type === "all"
			? categories
			: categories.filter((cat) => cat.type === search.type);

	const hasActiveFilters =
		!!search.q ||
		!!search.from ||
		!!search.to ||
		search.type !== "all" ||
		search.categoryId !== undefined ||
		search.min !== undefined ||
		search.max !== undefined;

	return (
		<div className="rounded-lg border bg-muted/50 p-4">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1.5">
					<Label
						htmlFor="mutations-search"
						className="font-medium text-muted-foreground text-xs"
					>
						Search
					</Label>
					<Input
						id="mutations-search"
						placeholder="Description or category…"
						value={qInput}
						onChange={(event) => setQInput(event.target.value)}
						className="h-8 w-[200px]"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Type
					</Label>
					<Select
						value={search.type}
						onValueChange={(value) =>
							onCommit({
								type: value as MutationsSearch["type"],
								// category lists differ per type (#32 toggle behavior)
								categoryId: undefined,
							})
						}
					>
						<SelectTrigger className="h-8 w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							<SelectItem value="income">Income</SelectItem>
							<SelectItem value="expense">Expense</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Category
					</Label>
					<Select
						value={
							search.categoryId === undefined
								? "all"
								: String(search.categoryId)
						}
						onValueChange={(value) =>
							onCommit({
								categoryId: value === "all" ? undefined : Number(value),
							})
						}
					>
						<SelectTrigger className="h-8 w-[160px]">
							<SelectValue placeholder="All categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{visibleCategories.map((cat) => (
								<SelectItem key={cat.id} value={String(cat.id)}>
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<MutationsDateField
					label="From"
					value={search.from}
					onSelect={(from) => onCommit({ from })}
				/>
				<MutationsDateField
					label="To"
					value={search.to}
					onSelect={(to) => onCommit({ to })}
				/>
				<div className="flex flex-col gap-1.5">
					<Label className="font-medium text-muted-foreground text-xs">
						Min Amount
					</Label>
					<Input
						type="number"
						placeholder="0"
						value={minInput}
						onChange={(event) => setMinInput(event.target.value)}
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
						value={maxInput}
						onChange={(event) => setMaxInput(event.target.value)}
						className="h-8 w-[100px]"
					/>
				</div>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8"
						onClick={() => {
							// Reset the local field buffers directly (no external sync).
							setQInput("");
							setMinInput("");
							setMaxInput("");
							onCommit({
								q: "",
								from: "",
								to: "",
								type: "all",
								categoryId: undefined,
								min: undefined,
								max: undefined,
							});
						}}
					>
						Clear
					</Button>
				)}
			</div>
		</div>
	);
}
