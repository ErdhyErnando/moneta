import { Button, Input } from "@cloudflare/kumo";
import { CategoryBadge } from "@/components/category-badge";
import {
	type Category,
	DEFAULT_CATEGORY_COLOR,
} from "@/components/category-types";
import { ResponsiveDialog } from "@/components/responsive-dialog";

type CategoryFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingCategory: Category | null;
	name: string;
	onNameChange: (name: string) => void;
	color: string;
	onColorChange: (color: string) => void;
	submitting: boolean;
	onSubmit: (e: React.FormEvent) => void;
};

// Create/edit dialog for the Categories settings page (#49).
export function CategoryFormDialog({
	open,
	onOpenChange,
	editingCategory,
	name,
	onNameChange,
	color,
	onColorChange,
	submitting,
	onSubmit,
}: CategoryFormDialogProps): React.JSX.Element {
	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			title={editingCategory ? "Edit category" : "Add category"}
		>
			<form onSubmit={onSubmit} className="space-y-4">
				<Input
					label="Category name"
					id="name"
					placeholder="e.g. Salary, Groceries, Rent"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					required
				/>

				<div className="space-y-1.5">
					<span className="font-medium text-sm">Colour</span>
					<div className="flex items-center gap-2">
						<Input
							id="color"
							type="color"
							value={color}
							onChange={(e) => onColorChange(e.target.value)}
							aria-label="Pick a colour"
							className="h-9 w-14 shrink-0 p-1 max-md:h-11"
						/>
						<Input
							type="text"
							value={color}
							onChange={(e) => onColorChange(e.target.value)}
							aria-label="Colour hex value"
							placeholder={DEFAULT_CATEGORY_COLOR}
							className="flex-1 tabular-nums"
							pattern="^#[0-9a-fA-F]{6}$"
						/>
					</div>
					<p className="text-kumo-subtle text-xs">
						Stored once and derived per theme, so the chip stays legible on both
						light and dark surfaces — this is the label your records will show.
					</p>
				</div>

				<div className="flex items-center gap-3 rounded-lg bg-kumo-recessed p-4">
					<span className="text-kumo-subtle text-sm">Preview</span>
					<CategoryBadge name={name.trim() || "Category"} color={color} />
				</div>

				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="secondary"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" variant="primary" loading={submitting}>
						{editingCategory ? "Update" : "Add"}
					</Button>
				</div>
			</form>
		</ResponsiveDialog>
	);
}
