import { Button } from "@cloudflare/kumo";
import {
	CaretLeftIcon,
	CaretLineLeftIcon,
	CaretLineRightIcon,
	CaretRightIcon,
} from "@phosphor-icons/react";

type Props = {
	/** Rows on the current page selection scope (after every filter). */
	rowCount: number;
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
 * never split across pages. Layout follows docs/design.md §7.5 — counts on the
 * left, page controls on the right.
 */
export function TransactionTablePagination({
	rowCount,
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
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<p className="text-kumo-subtle text-sm tabular-nums">
				{selectedCount > 0
					? `${selectedCount} selected`
					: `${rowCount} ${rowCount === 1 ? "entry" : "entries"}`}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<p className="text-kumo-subtle text-sm tabular-nums">
					Page {pageIndex + 1} of {pageCount} · {totalMonths} month
					{totalMonths === 1 ? "" : "s"}
				</p>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to first page"
					className="max-md:size-11 max-lg:hidden"
					onClick={onFirst}
					disabled={atStart}
					icon={<CaretLineLeftIcon size={16} />}
				/>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to previous page"
					className="max-md:size-11"
					onClick={onPrevious}
					disabled={atStart}
					icon={<CaretLeftIcon size={16} />}
				/>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to next page"
					className="max-md:size-11"
					onClick={onNext}
					disabled={atEnd}
					icon={<CaretRightIcon size={16} />}
				/>
				<Button
					variant="secondary"
					size="sm"
					shape="square"
					aria-label="Go to last page"
					className="max-md:size-11 max-lg:hidden"
					onClick={onLast}
					disabled={atEnd}
					icon={<CaretLineRightIcon size={16} />}
				/>
			</div>
		</div>
	);
}
