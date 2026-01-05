import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { api } from "@/lib/api";

type Category = {
	id: number;
	name: string;
	type: "income" | "expense" | "starting_balance";
};

type CategoryFormData = {
	name: string;
	type: "income" | "expense" | "starting_balance";
};

export function CategorySettings() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState<string>("income");
	const [name, setName] = useState("");

	const { data: categories = [], isLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.get<{ categories: Category[] }>("/api/categories");
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
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to add category",
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
			data: CategoryFormData;
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
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to update category",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/api/categories/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setIsDeleteOpen(false);
			setDeletingCategory(null);
			toast({
				title: "Success",
				description: "Category deleted successfully",
			});
		},
		onError: (error: AxiosError<{ error: { message: string } }>) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.error?.message || "Failed to delete category",
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const data: CategoryFormData = {
			name,
			type: activeTab as "income" | "expense" | "starting_balance",
		};

		if (editingCategory) {
			updateMutation.mutate({ id: editingCategory.id, data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (category: Category) => {
		setEditingCategory(category);
		setName(category.name);
		setIsOpen(true);
	};

	const handleDelete = (category: Category) => {
		setDeletingCategory(category);
		setIsDeleteOpen(true);
	};

	const renderCategoryTable = (type: string) => {
		const filteredCategories = categories.filter((c) => c.type === type);

		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead className="w-[100px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={2} className="text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : filteredCategories.length === 0 ? (
							<TableRow>
								<TableCell colSpan={2} className="text-center">
									No categories found
								</TableCell>
							</TableRow>
						) : (
							filteredCategories.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleEdit(category)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(category)}
												className="text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-xl">Categories</h2>
				<Button
					onClick={() => {
						setEditingCategory(null);
						setName("");
						setIsOpen(true);
					}}
				>
					<Plus className="mr-2 h-4 w-4" /> Add Category
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="income">Income</TabsTrigger>
					<TabsTrigger value="expense">Expense</TabsTrigger>
					<TabsTrigger value="starting_balance">Starting Balance</TabsTrigger>
				</TabsList>
				<TabsContent value="income" className="mt-4">
					{renderCategoryTable("income")}
				</TabsContent>
				<TabsContent value="expense" className="mt-4">
					{renderCategoryTable("expense")}
				</TabsContent>
				<TabsContent value="starting_balance" className="mt-4">
					{renderCategoryTable("starting_balance")}
				</TabsContent>
			</Tabs>

			{/* Add/Edit Dialog */}
			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						setEditingCategory(null);
						setName("");
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

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the category "
							{deletingCategory?.name}"? This might affect existing transactions
							assigned to this category.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								deletingCategory && deleteMutation.mutate(deletingCategory.id)
							}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
