import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { CurrencySelector } from "@/components/currency-selector";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import {
	MutationsPagination,
	MutationsTable,
} from "@/components/mutations/mutations-table";
import { MutationsToolbar } from "@/components/mutations/mutations-toolbar";
import { useToast } from "@/hooks/use-toast";
import { type AxiosError, api } from "@/lib/api";
import {
	type MutationsResponse,
	type MutationsSearch,
	mutationsSearchSchema,
	mutationsSearchToApiParams,
	partializeMutationsSearch,
} from "@/lib/mutations";

export const Route = createFileRoute("/_authenticated/mutations")({
	component: MutationsPage,
	validateSearch: (search: Record<string, unknown>): MutationsSearch =>
		mutationsSearchSchema.parse(search),
});

function MutationsPage() {
	const { toast } = useToast();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const setSearch = React.useCallback(
		(patch: Partial<MutationsSearch>) => {
			const next: MutationsSearch = { ...search, page: 1, ...patch };
			// Only non-default params go into the URL; validateSearch re-applies
			// the defaults when the link is opened again (#33 shareable filters).
			navigate({
				search: partializeMutationsSearch(next) as MutationsSearch,
			});
		},
		[navigate, search],
	);

	const handleSortChange = React.useCallback(
		(column: "date" | "amount") => {
			setSearch(
				search.sort === column
					? { sort: column, dir: search.dir === "asc" ? "desc" : "asc" }
					: { sort: column, dir: "desc" },
			);
		},
		[search.sort, search.dir, setSearch],
	);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["mutations", search],
		queryFn: async () => {
			const res = await api.get<MutationsResponse>("/api/mutations", {
				params: mutationsSearchToApiParams(search),
			});
			return res.data;
		},
	});

	React.useEffect(() => {
		if (isError) {
			const axiosError = error as AxiosError<{ error: { message: string } }>;
			toast({
				title: "Error",
				description:
					axiosError.response?.data?.error?.message ||
					"Failed to load mutations",
				variant: "destructive",
			});
		}
	}, [isError, error, toast]);

	return (
		<div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="font-bold text-2xl sm:text-3xl">Mutations</h1>
					<p className="text-muted-foreground text-sm">
						Combined income and expense ledger
					</p>
				</div>
				<div className="flex items-center gap-2">
					<CurrencySelector />
					<AddTransactionDialog />
				</div>
			</div>

			<div className="space-y-4">
				<MutationsToolbar search={search} onCommit={setSearch} />
				<MutationsTable
					mutations={data?.mutations ?? []}
					isLoading={isLoading}
					sort={search.sort}
					dir={search.dir}
					onSortChange={handleSortChange}
				/>
				<MutationsPagination
					page={search.page}
					totalPages={data?.totalPages ?? 1}
					total={data?.total ?? 0}
					onPageChange={(page) => setSearch({ page })}
				/>
			</div>
		</div>
	);
}
