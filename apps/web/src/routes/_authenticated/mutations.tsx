import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { CurrencySelector } from "@/components/currency-selector";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { PageContainer, PageHeader } from "@/components/layout";
import {
	MutationsPagination,
	MutationsTable,
} from "@/components/mutations/mutations-table";
import { MutationsToolbar } from "@/components/mutations/mutations-toolbar";
import { api } from "@/lib/api";
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

function MutationsPage(): React.JSX.Element {
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

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["mutations", search],
		queryFn: async () => {
			const res = await api.get<MutationsResponse>("/api/mutations", {
				params: mutationsSearchToApiParams(search),
			});
			return res.data;
		},
	});

	return (
		<PageContainer>
			<PageHeader
				title="Mutations"
				description="Combined income and expense ledger."
				actions={
					<>
						<CurrencySelector />
						<AddTransactionDialog className="max-md:hidden" />
					</>
				}
			/>

			<div className="space-y-4">
				<MutationsToolbar search={search} onCommit={setSearch} />
				<MutationsTable
					mutations={data?.mutations ?? []}
					isLoading={isLoading}
					isError={isError}
					onRetry={() => {
						void refetch();
					}}
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
		</PageContainer>
	);
}
