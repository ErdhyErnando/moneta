import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelector } from "@/components/currency-selector";
import TransactionForm from "@/components/transaction-form";
import {
  TransactionTable,
  type Transaction,
} from "@/components/transaction-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/expense")({
  component: ExpensePage,
});

type TransactionFormData = {
  amount: string;
  description?: string;
  date: Date;
  categoryId: number;
};

function ExpensePage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await api.get<{ expenses: Transaction[] }>("/api/expenses");
      return res.data.expenses;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      await api.post("/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.message || "Failed to add expense",
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
      data: TransactionFormData;
    }) => {
      await api.put(`/api/expenses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsOpen(false);
      setEditingId(null);
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.message || "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      setIsDeleteOpen(false);
      setDeleteId(null);
    },
    onError: (error: AxiosError<{ error: { message: string } }>) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.error?.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: TransactionFormData) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setIsOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setDeleteId(transaction.id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
    }
  };

  const editingExpense = editingId
    ? expenses.find((e) => e.id === editingId)
    : undefined;

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-bold text-2xl sm:text-3xl">Expenses</h1>
        <div className="flex items-center gap-2">
          <CurrencySelector />
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setEditingId(null);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Expense" : "Add Expense"}
                </DialogTitle>
              </DialogHeader>
              <TransactionForm
                type="expense"
                onSubmit={handleSubmit}
                defaultValues={
                  editingExpense
                    ? {
                        amount: editingExpense.amount,
                        description: editingExpense.description,
                        date: new Date(editingExpense.date),
                        categoryId: editingExpense.categoryId,
                      }
                    : undefined
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransactionTable
        data={expenses}
        type="expense"
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
