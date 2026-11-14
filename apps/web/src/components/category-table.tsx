import { Button, Table } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import {
	ArrowCounterClockwiseIcon,
	DotsThreeVerticalIcon,
	PencilSimpleIcon,
	TagIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { CategoryBadge } from "@/components/category-badge";
import type { Category, CategoryType } from "@/components/category-types";
import { EmptyState } from "@/components/layout";

type CategoryTableProps = {
	categories: Category[];
	isLoading: boolean;
	type: CategoryType;
	isRestoring: boolean;
	onEdit: (category: Category) => void;
	onArchive: (category: Category) => void;
	onRestore: (id: number) => void;
};

const TABLE_CLASSES =
	"[&_td]:py-2 [&_th]:border-kumo-hairline [&_th]:text-kumo-subtle [&_th]:text-sm";

const TYPE_LABEL: Record<CategoryType, string> = {
	income: "income",
	expense: "expense",
	starting_balance: "starting balance",
};

function CategoryActions({
	category,
	isRestoring,
	onEdit,
	onArchive,
	onRestore,
}: {
	category: Category;
	isRestoring: boolean;
	onEdit: (category: Category) => void;
	onArchive: (category: Category) => void;
	onRestore: (id: number) => void;
}): React.JSX.Element {
	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="ghost"
					size="sm"
					shape="square"
					aria-label="Open menu"
					className="max-md:size-11"
					icon={<DotsThreeVerticalIcon size={16} />}
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" className="w-44">
				{category.isArchived ? (
					<DropdownMenu.Item
						disabled={isRestoring}
						onClick={() => onRestore(category.id)}
					>
						<ArrowCounterClockwiseIcon size={16} />
						Restore
					</DropdownMenu.Item>
				) : (
					<>
						<DropdownMenu.Item onClick={() => onEdit(category)}>
							<PencilSimpleIcon size={16} />
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							variant="danger"
							onClick={() => onArchive(category)}
						>
							<TrashIcon size={16} />
							Archive
						</DropdownMenu.Item>
					</>
				)}
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}

/**
 * Categories of one type (#49). The colour you see is the one the rest of the
 * app renders: `CategoryBadge` derives the per-mode mark from
 * `categories.color` (§2.7), so this table cannot drift from the chips in the
 * ledger, dashboard and charts (#19).
 */
export function CategoryTable({
	categories,
	isLoading,
	type,
	isRestoring,
	onEdit,
	onArchive,
	onRestore,
}: CategoryTableProps): React.JSX.Element {
	const filtered = categories.filter((category) => category.type === type);

	if (isLoading) {
		return (
			<div className="space-y-2 rounded-xl border border-kumo-hairline bg-kumo-base p-4">
				{[0, 1, 2].map((row) => (
					<div
						key={row}
						className="h-10 w-full animate-pulse rounded bg-kumo-fill"
					/>
				))}
			</div>
		);
	}

	if (filtered.length === 0) {
		return (
			<div className="rounded-xl border border-kumo-hairline bg-kumo-base">
				<EmptyState
					icon={<TagIcon size={20} />}
					title={`No ${TYPE_LABEL[type]} categories yet`}
					description="Add one to start labelling your records."
					className="py-8"
				/>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-kumo-hairline bg-kumo-base">
			<div className="hidden md:block">
				<Table className={TABLE_CLASSES}>
					<Table.Header>
						<Table.Row>
							<Table.Head>Category</Table.Head>
							<Table.Head className="w-32">Status</Table.Head>
							<Table.Head className="w-16 text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{filtered.map((category) => (
							<Table.Row key={category.id}>
								<Table.Cell className="font-medium">{category.name}</Table.Cell>
								<Table.Cell>
									<CategoryBadge name={category.name} color={category.color} />
								</Table.Cell>
								<Table.Cell className="text-kumo-subtle">
									{category.isArchived ? "Archived" : "Active"}
								</Table.Cell>
								<Table.Cell className="text-right">
									<CategoryActions
										category={category}
										isRestoring={isRestoring}
										onEdit={onEdit}
										onArchive={onArchive}
										onRestore={onRestore}
									/>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</div>

			<ul className="divide-y divide-kumo-hairline md:hidden">
				{filtered.map((category) => (
					<li key={category.id} className="flex items-center gap-2 px-4 py-2">
						<div className="min-w-0 flex-1 space-y-1">
							<CategoryBadge
								name={category.name}
								color={category.color}
								className="font-medium"
							/>
							{category.isArchived ? (
								<span className="block text-kumo-subtle text-xs">Archived</span>
							) : null}
						</div>
						<CategoryActions
							category={category}
							isRestoring={isRestoring}
							onEdit={onEdit}
							onArchive={onArchive}
							onRestore={onRestore}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
