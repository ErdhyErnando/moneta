import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CategoryTable } from "@/components/category-table";
import {
	type Category,
	type CategoryType,
	categoryTypes,
} from "@/components/category-types";
import { CategoryFormDialog } from "@/components/category-form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { AxiosError } from "@/lib/api";
import { api } from "@/lib/api";



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


function getErrorMessage(error: CategoryError, fallback: string) {
	const errorPayload = error.response?.data?.error;
	if (typeof errorPayload === "string") {
		return errorPayload;
	}

	return errorPayload?.message || fallback;
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
				{categoryTypes.map((type) => (
				<TabsContent key={type} value={type} className="mt-4">
					<CategoryTable
						categories={categories}
						isLoading={isLoading}
						type={type}
						isRestoring={restoreMutation.isPending}
						onEdit={handleEdit}
						onArchive={handleArchive}
						onRestore={restoreMutation.mutate}
					/>
				</TabsContent>
			))}
			</Tabs>

			<CategoryFormDialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						setEditingCategory(null);
						setName("");
						setColor("#0ea5e9");
					}
				}}
				editingCategory={editingCategory}
				name={name}
				onNameChange={setName}
				color={color}
				onColorChange={setColor}
				submitting={createMutation.isPending || updateMutation.isPending}
				onSubmit={handleSubmit}
			/>

			<DeleteConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Archive Category"
				description={`Archive "${deletingCategory?.name}"? Existing records will keep this category, but it will no longer appear when adding new records.`}
				onConfirm={() =>
					deletingCategory && archiveMutation.mutate(deletingCategory.id)
				}
				pending={archiveMutation.isPending}
				confirmLabel="Archive"
				pendingLabel="Archiving..."
			/>
		</div>
	);
}
