import {
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type Props = {
	selectedCount: number;
	totalMonths: number;
	pageIndex: number;
	pageCount: number;
	onFirst: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onLast: () => void;
};

/**
 * Pagination for the #32 monthly accordion: pages are MONTH GROUPS
 * (MONTHS_PER_PAGE months per page), never individual rows, so a month is
 * never split across pages.
 */
export function TransactionTablePagination({
	selectedCount,
	totalMonths,
	pageIndex,
	pageCount,
	onFirst,
	onPrevious,
	onNext,
	onLast,
}: Props) {
	return (
		<div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="text-muted-foreground text-sm">
				{selectedCount} row(s) selected.
			</div>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8">
				<div className="flex items-center justify-between gap-2 sm:justify-center">
					<div className="flex w-[180px] items-center justify-center font-medium text-sm">
						Page {pageIndex + 1} of {pageCount} · {totalMonths} month
						{totalMonths === 1 ? "" : "s"}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={onFirst}
							disabled={pageIndex === 0}
						>
							<span className="sr-only">Go to first page</span>
							<IconChevronsLeft className="size-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={onPrevious}
							disabled={pageIndex === 0}
						>
							<span className="sr-only">Go to previous page</span>
							<IconChevronLeft className="size-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={onNext}
							disabled={pageIndex >= pageCount - 1}
						>
							<span className="sr-only">Go to next page</span>
							<IconChevronRight className="size-4" />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={onLast}
							disabled={pageIndex >= pageCount - 1}
						>
							<span className="sr-only">Go to last page</span>
							<IconChevronsRight className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
