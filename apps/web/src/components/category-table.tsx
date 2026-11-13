import { Button } from "@cloudflare/kumo";
import {
	ArrowCounterClockwiseIcon,
	PencilSimpleIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import type { Category, CategoryType } from "@/components/category-types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

function CategoryBadgePreview({
	color,
	name,
}: {
	color: string;
	name: string;
}) {
	return (
		<span
			className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-medium text-white text-xs"
			style={{ backgroundColor: color }}
		>
			{name}
		</span>
	);
}

type CategoryTableProps = {
	categories: Category[];
	isLoading: boolean;
	type: CategoryType;
	isRestoring: boolean;
	onEdit: (category: Category) => void;
	onArchive: (category: Category) => void;
	onRestore: (id: number) => void;
};

export function CategoryTable({
	categories,
	isLoading,
	type,
	isRestoring,
	onEdit,
	onArchive,
	onRestore,
}: CategoryTableProps) {
	const filteredCategories = categories.filter(
		(category) => category.type === type,
	);

	return (
		<div className="rounded-xl border border-kumo-hairline">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-[140px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={3} className="text-center">
								Loading...
							</TableCell>
						</TableRow>
					) : filteredCategories.length === 0 ? (
						<TableRow>
							<TableCell colSpan={3} className="text-center">
								No categories found
							</TableCell>
						</TableRow>
					) : (
						filteredCategories.map((category) => (
							<TableRow key={category.id}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<span
											className="inline-block h-3 w-3 rounded-full border"
											style={{ backgroundColor: category.color }}
										/>
										<CategoryBadgePreview
											color={category.color}
											name={category.name}
										/>
									</div>
								</TableCell>
								<TableCell className="text-kumo-subtle">
									{category.isArchived ? "Archived" : "Active"}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										{category.isArchived ? (
											<Button
												variant="ghost"
												size="sm"
												shape="square"
												onClick={() => onRestore(category.id)}
												disabled={isRestoring}
												aria-label={`Restore ${category.name}`}
												icon={<ArrowCounterClockwiseIcon size={16} />}
											/>
										) : (
											<>
												<Button
													variant="ghost"
													size="sm"
													shape="square"
													onClick={() => onEdit(category)}
													aria-label={`Edit ${category.name}`}
													icon={<PencilSimpleIcon size={16} />}
												/>
												<Button
													variant="secondary-destructive"
													size="sm"
													shape="square"
													onClick={() => onArchive(category)}
													aria-label={`Archive ${category.name}`}
													icon={<TrashIcon size={16} />}
												/>
											</>
										)}
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
