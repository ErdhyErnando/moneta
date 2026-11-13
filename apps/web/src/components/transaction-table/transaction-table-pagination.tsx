import { Button } from "@cloudflare/kumo";
import {
	CaretLeftIcon,
	CaretLineLeftIcon,
	CaretLineRightIcon,
	CaretRightIcon,
} from "@phosphor-icons/react";

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
}: Props): React.JSX.Element {
	const atStart = pageIndex === 0;
	const atEnd = pageIndex >= pageCount - 1;

	return (
		<div className="flex flex-col gap-4 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
			<div className="text-kumo-subtle text-sm">
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
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to first page"
							className="hidden lg:inline-flex"
							onClick={onFirst}
							disabled={atStart}
							icon={<CaretLineLeftIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to previous page"
							onClick={onPrevious}
							disabled={atStart}
							icon={<CaretLeftIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to next page"
							onClick={onNext}
							disabled={atEnd}
							icon={<CaretRightIcon size={16} />}
						/>
						<Button
							variant="secondary"
							size="sm"
							shape="square"
							aria-label="Go to last page"
							className="hidden lg:inline-flex"
							onClick={onLast}
							disabled={atEnd}
							icon={<CaretLineRightIcon size={16} />}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
