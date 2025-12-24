import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconFilter,
	IconLayoutColumns,
	IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import * as React from "react";

import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/contexts/currency-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Helper function to get start of day timestamp without mutating
const getStartOfDay = (date: Date): number => {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		0,
		0,
		0,
		0,
	).getTime();
};

// Helper function to get end of day timestamp without mutating
const getEndOfDay = (date: Date): number => {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		23,
		59,
		59,
		999,
	).getTime();
};

export type Transaction = {
	id: number;
	amount: string;
	description: string;
	date: string;
	categoryId: number;
	category: {
		id: number;
		name: string;
		type: "income" | "expense";
	};
};

type Category = {
	id: number;
	name: string;
	type: "income" | "expense";
};

type TransactionTableProps = {
	data: Transaction[];
	type: "income" | "expense";
	isLoading?: boolean;
	onEdit?: (transaction: Transaction) => void;
	onDelete?: (transaction: Transaction) => void;
};

export function TransactionTable({
	data,
	type,
	isLoading = false,
	onEdit,
	onDelete,
}: TransactionTableProps) {
	const { formatCurrency } = useCurrency();
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// Filter states
	const [showFilters, setShowFilters] = React.useState(false);
	const [startDate, setStartDate] = React.useState<Date | undefined>();
	const [endDate, setEndDate] = React.useState<Date | undefined>();
	const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
	const [minAmount, setMinAmount] = React.useState<string>("");
	const [maxAmount, setMaxAmount] = React.useState<string>("");

	// Fetch categories for filter
	const { data: categories = [] } = useQuery({
		queryKey: ["categories", type],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
			return res.data.categories.filter((c) => c.type === type);
		},
	});

	// Filter data based on filter states
	const filteredData = React.useMemo(() => {
		return data.filter((transaction) => {
			// Date filter - using non-mutating approach
			const transactionTimestamp = new Date(transaction.date).getTime();

			if (startDate) {
				const startTimestamp = getStartOfDay(startDate);
				if (transactionTimestamp < startTimestamp) return false;
			}
			if (endDate) {
				const endTimestamp = getEndOfDay(endDate);
				if (transactionTimestamp > endTimestamp) return false;
			}

			// Category filter
			if (selectedCategory && selectedCategory !== "all") {
				if (transaction.categoryId !== Number(selectedCategory)) return false;
			}

			// Amount filter
			const amount = Number(transaction.amount);
			// if transaction amount is not valid number, exclude it
			if (Number.isNaN(amount)) return false;
			if (minAmount) {
				const min = Number(minAmount);
				if (!Number.isNaN(min) && amount < min) return false;
			}
			if (maxAmount) {
				const max = Number(maxAmount);
				if (!Number.isNaN(max) && amount > max) return false;
			}

			return true;
		});
	}, [data, startDate, endDate, selectedCategory, minAmount, maxAmount]);

	const clearFilters = () => {
		setStartDate(undefined);
		setEndDate(undefined);
		setSelectedCategory("all");
		setMinAmount("");
		setMaxAmount("");
	};

	const hasActiveFilters =
		startDate ||
		endDate ||
		(selectedCategory && selectedCategory !== "all") ||
		minAmount ||
		maxAmount;

	const columns: ColumnDef<Transaction>[] = React.useMemo(
		() => [
			{
				id: "select",
				header: ({ table }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && "indeterminate")
							}
							onCheckedChange={(value) =>
								table.toggleAllPageRowsSelected(!!value)
							}
							aria-label="Select all"
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							aria-label="Select row"
						/>
					</div>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ row }) => {
					const date = new Date(row.getValue("date"));
					return (
						<div className="whitespace-nowrap font-medium">
							{format(date, "MMM d, yyyy")}
						</div>
					);
				},
			},
			{
				accessorKey: "category",
				header: "Category",
				cell: ({ row }) => {
					const category = row.original.category;
					return <CategoryBadge name={category.name} />;
				},
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) => (
					<div className="max-w-[200px] truncate font-medium md:max-w-[300px]">
						{row.getValue("description") || "-"}
					</div>
				),
			},
			{
				accessorKey: "amount",
				header: () => <div className="text-right">Amount</div>,
				cell: ({ row }) => {
					const amount = Number.parseFloat(row.original.amount);
					const formatted = formatCurrency(amount);

					return (
						<div
							className={cn(
								"whitespace-nowrap text-right font-medium",
								type === "income" ? "text-emerald-600" : "text-rose-600",
							)}
						>
							{type === "income" ? "+" : "-"}
							{formatted}
						</div>
					);
				},
			},
			{
				id: "actions",
				cell: ({ row }) => {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
									size="icon"
								>
									<IconDotsVertical className="size-4" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-32">
								<DropdownMenuItem onClick={() => onEdit?.(row.original)}>
									Edit
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => onDelete?.(row.original)}
								>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[formatCurrency, type, onEdit, onDelete],
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div className="w-full space-y-4">
			{/* Toolbar */}
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="description-filter" className="sr-only">
							Filter by description
						</Label>
						<Input
							id="description-filter"
							placeholder="Filter descriptions..."
							value={
								(table.getColumn("description")?.getFilterValue() as string) ??
								""
							}
							onChange={(event) =>
								table
									.getColumn("description")
									?.setFilterValue(event.target.value)
							}
							className="max-w-sm"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant={showFilters ? "secondary" : "outline"}
							size="sm"
							onClick={() => setShowFilters(!showFilters)}
						>
							<IconFilter className="mr-2 size-4" />
							Filters
							{hasActiveFilters && (
								<span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
									{table.getState().columnFilters.length}
								</span>
							)}
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<IconLayoutColumns className="mr-2 size-4" />
									<span className="hidden sm:inline">Columns</span>
									<IconChevronDown className="ml-2 size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								{table
									.getAllColumns()
									.filter(
										(column) =>
											typeof column.accessorFn !== "undefined" &&
											column.getCanHide(),
									)
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) =>
													column.toggleVisibility(!!value)
												}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Filter Panel */}
				{showFilters && (
					<div className="rounded-lg border bg-muted/50 p-4">
						<div className="flex flex-wrap items-end gap-4">
							{/* Date Range Filter */}
							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="start-date-filter"
									className="font-medium text-muted-foreground text-xs"
								>
									Start Date
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											id="start-date-filter"
											variant="outline"
											size="sm"
											className={cn(
												"w-[140px] justify-start text-left font-normal",
												!startDate && "text-muted-foreground",
											)}
										>
											{startDate
												? format(startDate, "MMM d, yyyy")
												: "Pick date"}
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
								<Label
									htmlFor="end-date-filter"
									className="font-medium text-muted-foreground text-xs"
								>
									End Date
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											id="end-date-filter"
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

							{/* Category Filter */}
							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="category-filter"
									className="font-medium text-muted-foreground text-xs"
								>
									Category
								</Label>
								<Select
									value={selectedCategory}
									onValueChange={setSelectedCategory}
								>
									<SelectTrigger id="category-filter" className="h-8 w-40">
										<SelectValue placeholder="All categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All categories</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category.id} value={String(category.id)}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Amount Range Filter */}
							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="min-amount-filter"
									className="font-medium text-muted-foreground text-xs"
								>
									Min Amount
								</Label>
								<Input
									id="min-amount-filter"
									type="number"
									placeholder="0"
									value={minAmount}
									onChange={(e) => setMinAmount(e.target.value)}
									className="h-8 w-[100px]"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<Label
									htmlFor="max-amount-filter"
									className="font-medium text-muted-foreground text-xs"
								>
									Max Amount
								</Label>
								<Input
									id="max-amount-filter"
									type="number"
									placeholder="No limit"
									value={maxAmount}
									onChange={(e) => setMaxAmount(e.target.value)}
									className="h-8 w-[100px]"
								/>
							</div>

							{/* Clear Filters */}
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="h-8"
								>
									<IconX className="mr-1 size-4" />
									Clear
								</Button>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} className="whitespace-nowrap">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									<div className="flex items-center justify-center">
										Loading...
									</div>
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No {type === "income" ? "incomes" : "expenses"} found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-muted-foreground text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="whitespace-nowrap font-medium text-sm">
							Rows per page
						</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center justify-between gap-2 sm:justify-center">
						<div className="flex w-[100px] items-center justify-center font-medium text-sm">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount() || 1}
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								className="h-8 w-8 p-0"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight className="size-4" />
							</Button>
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
