import { Button, Input } from "@cloudflare/kumo";
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
}: CategoryFormDialogProps) {
	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			title={editingCategory ? "Edit Category" : "Add Category"}
		>
			<form onSubmit={onSubmit} className="space-y-4">
				<Input
					label="Category Name"
					id="name"
					placeholder="e.g. Salary, Groceries, Rent"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					required
				/>
				<div className="space-y-2">
					<span className="font-medium text-sm">Color</span>
					<div className="flex items-center gap-2">
						<Input
							id="color"
							type="color"
							value={color}
							onChange={(e) => onColorChange(e.target.value)}
							className="h-9 w-14 p-1"
						/>
						<Input
							type="text"
							value={color}
							onChange={(e) => onColorChange(e.target.value)}
							placeholder={DEFAULT_CATEGORY_COLOR}
							className="flex-1"
							pattern="^#[0-9a-fA-F]{6}$"
						/>
						<span
							className="inline-flex h-6 w-6 rounded-full border"
							style={{ backgroundColor: color }}
							aria-hidden
						/>
					</div>
					<p className="text-kumo-subtle text-xs">
						Hex color used for pie + pill (solid badge, white text) — same for
						dashboard and income/expense tables
					</p>
				</div>
				<div className="flex justify-end gap-2 pt-2">
					<Button
						type="button"
						variant="secondary"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" variant="primary" disabled={submitting}>
						{editingCategory ? "Update" : "Add"}
					</Button>
				</div>
			</form>
		</ResponsiveDialog>
	);
}
