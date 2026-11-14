import { Button, Input, Label, Select } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MutationsSearch } from "@/lib/mutations";
import { MutationsDateField } from "./mutations-date-field";
import { useDebouncedField } from "./use-debounced-field";

type Category = { id: number; name: string; type: string };

type Props = {
	search: MutationsSearch;
	onCommit: (patch: Partial<MutationsSearch>) => void;
};

/** One option per {sort, dir} pair, only shown below `md` (no table header). */
const SORT_ITEMS = [
	{ label: "Date, newest first", value: "date-desc" },
	{ label: "Date, oldest first", value: "date-asc" },
	{ label: "Amount, high to low", value: "amount-desc" },
	{ label: "Amount, low to high", value: "amount-asc" },
];

const FIELD_LABEL = "font-medium text-kumo-subtle text-xs";

function parseAmount(raw: string): number | undefined {
	if (!raw) return undefined;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** All state lives in the URL search params (#33 shareable filters). */
export function MutationsToolbar({
	search,
	onCommit,
}: Props): React.JSX.Element {
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
		<div className="rounded-lg bg-kumo-recessed p-4">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="mutations-search" className={FIELD_LABEL}>
						Search
					</Label>
					<Input
						id="mutations-search"
						size="sm"
						placeholder="Description or category…"
						value={qInput}
						onChange={(event) => setQInput(event.target.value)}
						className="w-50 max-md:h-11"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className={FIELD_LABEL}>Type</Label>
					<Select
						size="sm"
						className="w-30 max-md:h-11"
						aria-label="Type"
						value={search.type}
						onValueChange={(value) =>
							onCommit({
								type: (value ?? "all") as MutationsSearch["type"],
								// category lists differ per type (#32 toggle behavior)
								categoryId: undefined,
							})
						}
						items={[
							{ label: "All types", value: "all" },
							{ label: "Income", value: "income" },
							{ label: "Expense", value: "expense" },
						]}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className={FIELD_LABEL}>Category</Label>
					<Select
						size="sm"
						className="w-40 max-md:h-11"
						aria-label="Category"
						placeholder="All categories"
						value={
							search.categoryId === undefined
								? "all"
								: String(search.categoryId)
						}
						onValueChange={(value) =>
							onCommit({
								categoryId:
									!value || value === "all" ? undefined : Number(value),
							})
						}
						items={[
							{ label: "All categories", value: "all" },
							...visibleCategories.map((cat) => ({
								label: cat.name,
								value: String(cat.id),
							})),
						]}
					/>
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
					<Label className={FIELD_LABEL}>Min Amount</Label>
					<Input
						type="number"
						size="sm"
						aria-label="Min amount"
						placeholder="0"
						value={minInput}
						onChange={(event) => setMinInput(event.target.value)}
						className="w-25 max-md:h-11"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label className={FIELD_LABEL}>Max Amount</Label>
					<Input
						type="number"
						size="sm"
						aria-label="Max amount"
						placeholder="No limit"
						value={maxInput}
						onChange={(event) => setMaxInput(event.target.value)}
						className="w-25 max-md:h-11"
					/>
				</div>
				{/* Below md there is no table header, so sorting needs its own control. */}
				<div className="flex flex-col gap-1.5 md:hidden">
					<Label className={FIELD_LABEL}>Sort</Label>
					<Select
						size="sm"
						className="w-50 max-md:h-11"
						aria-label="Sort"
						value={`${search.sort}-${search.dir}`}
						onValueChange={(value) => {
							if (!value) return;
							const [sort, dir] = value.split("-");
							onCommit({
								sort: sort as MutationsSearch["sort"],
								dir: dir as MutationsSearch["dir"],
							});
						}}
						items={SORT_ITEMS}
					/>
				</div>
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						icon={<XIcon size={16} />}
						className="max-md:h-11"
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
