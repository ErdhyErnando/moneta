import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "@/lib/api";
import { api } from "@/lib/api";

const categoryTypes = ["income", "expense", "starting_balance"] as const;

type CategoryType = (typeof categoryTypes)[number];

type Category = {
	id: number;
	name: string;
	type: CategoryType;
	color: string;
	isArchived: boolean;
};

type CategoryFormData = {
	name: string;
	type: CategoryType;
	color?: string;
};

type CategoryUpdateData = {
	name: string;
	color?: string;
};

type CategoryError = AxiosError<{ error?: { message?: string } | string }>;

type CategoryTableProps = {
	categories: Category[];
	isLoading: boolean;
	type: CategoryType;
	isRestoring: boolean;
	onEdit: (category: Category) => void;
	onArchive: (category: Category) => void;
	onRestore: (id: number) => void;
};

function getErrorMessage(error: CategoryError, fallback: string) {
	const errorPayload = error.response?.data?.error;
	if (typeof errorPayload === "string") {
		return errorPayload;
	}

	return errorPayload?.message || fallback;
}

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

function CategoryTable({
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
		<div className="rounded-md border">
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
								<TableCell className="text-muted-foreground">
									{category.isArchived ? "Archived" : "Active"}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										{category.isArchived ? (
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onRestore(category.id)}
												disabled={isRestoring}
											>
												<ArchiveRestore className="h-4 w-4" />
											</Button>
										) : (
											<>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onEdit(category)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => onArchive(category)}
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
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

export function CategorySettings() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState<CategoryType>("income");
	const [name, setName] = useState("");
	const [color, setColor] = useState("#0ea5e9");

	const { data: categories = [], isLoading } = useQuery({
		queryKey: ["categories", "includeArchived"],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>(
				"/api/categories?includeArchived=true",
			);
			return res.data.categories;
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CategoryFormData) => {
			await api.post("/api/categories", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setIsOpen(false);
			setName("");
			toast({
				title: "Success",
				description: "Category added successfully",
			});
		},
		onError: (error: CategoryError) => {
			toast({
				title: "Error",
				description: getErrorMessage(error, "Failed to add category"),
				variant: "destructive",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: number;
			data: CategoryUpdateData;
		}) => {
			await api.put(`/api/categories/${id}`, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setIsOpen(false);
			setEditingCategory(null);
			setName("");
			toast({
				title: "Success",
				description: "Category updated successfully",
			});
		},
		onError: (error: CategoryError) => {
			toast({
				title: "Error",
				description: getErrorMessage(error, "Failed to update category"),
				variant: "destructive",
			});
		},
	});

	const archiveMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/categories/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setIsDeleteOpen(false);
			setDeletingCategory(null);
			toast({
				title: "Success",
				description: "Category archived successfully",
			});
		},
		onError: (error: CategoryError) => {
			toast({
				title: "Error",
				description: getErrorMessage(error, "Failed to archive category"),
				variant: "destructive",
			});
		},
	});

	const restoreMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.post(`/api/categories/${id}/restore`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast({
				title: "Success",
				description: "Category restored successfully",
			});
		},
		onError: (error: CategoryError) => {
			toast({
				title: "Error",
				description: getErrorMessage(error, "Failed to restore category"),
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();

		if (!trimmedName) {
			return;
		}

		if (editingCategory) {
			updateMutation.mutate({
				id: editingCategory.id,
				data: { name: trimmedName, color },
			});
		} else {
			createMutation.mutate({ name: trimmedName, type: activeTab, color });
		}
	};

	const handleEdit = (category: Category) => {
		setEditingCategory(category);
		setName(category.name);
		setColor(category.color || "#0ea5e9");
		setIsOpen(true);
	};

	const handleArchive = (category: Category) => {
		setDeletingCategory(category);
		setIsDeleteOpen(true);
	};

	const openCreateDialog = () => {
		setEditingCategory(null);
		setName("");
		setColor("#0ea5e9");
		setIsOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-xl">Categories</h2>
				<Button onClick={openCreateDialog}>
					<Plus className="mr-2 h-4 w-4" /> Add Category
				</Button>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as CategoryType)}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="income">Income</TabsTrigger>
					<TabsTrigger value="expense">Expense</TabsTrigger>
					<TabsTrigger value="starting_balance">Starting Balance</TabsTrigger>
				</TabsList>
				<TabsContent value="income" className="mt-4">
					<CategoryTable
						categories={categories}
						isLoading={isLoading}
						type="income"
						isRestoring={restoreMutation.isPending}
						onEdit={handleEdit}
						onArchive={handleArchive}
						onRestore={restoreMutation.mutate}
					/>
				</TabsContent>
				<TabsContent value="expense" className="mt-4">
					<CategoryTable
						categories={categories}
						isLoading={isLoading}
						type="expense"
						isRestoring={restoreMutation.isPending}
						onEdit={handleEdit}
						onArchive={handleArchive}
						onRestore={restoreMutation.mutate}
					/>
				</TabsContent>
				<TabsContent value="starting_balance" className="mt-4">
					<CategoryTable
						categories={categories}
						isLoading={isLoading}
						type="starting_balance"
						isRestoring={restoreMutation.isPending}
						onEdit={handleEdit}
						onArchive={handleArchive}
						onRestore={restoreMutation.mutate}
					/>
				</TabsContent>
			</Tabs>

			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						setEditingCategory(null);
						setName("");
						setColor("#0ea5e9");
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingCategory ? "Edit Category" : "Add Category"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Category Name</Label>
							<Input
								id="name"
								placeholder="e.g. Salary, Groceries, Rent"
								value={name}
								onChange={(e) => setName(e.target.value)}
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
									onChange={(e) => setColor(e.target.value)}
									className="h-9 w-14 p-1"
								/>
								<Input
									type="text"
									value={color}
									onChange={(e) => setColor(e.target.value)}
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
								Hex color used for pie + pill (solid badge, white text) — same
								for dashboard and income/expense tables
							</p>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={createMutation.isPending || updateMutation.isPending}
							>
								{editingCategory ? "Update" : "Add"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Archive Category</DialogTitle>
						<DialogDescription>
							Archive "{deletingCategory?.name}"? Existing records will keep
							this category, but it will no longer appear when adding new
							records.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								deletingCategory && archiveMutation.mutate(deletingCategory.id)
							}
							disabled={archiveMutation.isPending}
						>
							{archiveMutation.isPending ? "Archiving..." : "Archive"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
