import type { Category } from "@/components/category-types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{editingCategory ? "Edit Category" : "Add Category"}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Category Name</Label>
						<Input
							id="name"
							placeholder="e.g. Salary, Groceries, Rent"
							value={name}
							onChange={(e) => onNameChange(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="color">Color</Label>
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
								placeholder="#0ea5e9"
								className="flex-1"
								pattern="^#[0-9a-fA-F]{6}$"
							/>
							<span
								className="inline-flex h-6 w-6 rounded-full border"
								style={{ backgroundColor: color }}
								aria-hidden
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							Hex color used for pie + pill (solid badge, white text) — same for
							dashboard and income/expense tables
						</p>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{editingCategory ? "Update" : "Add"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
