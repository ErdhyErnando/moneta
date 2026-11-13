import { Plus } from "lucide-react";
import { useState } from "react";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Dashboard "Add Transaction" entry point. The form itself lives in
 * `AddTransactionForm` so the mobile bottom-nav sheet can share it.
 */
export function AddTransactionDialog() {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<"expense" | "income">("expense");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Add Transaction
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Add {type === "expense" ? "Expense" : "Income"}
					</DialogTitle>
				</DialogHeader>
				<AddTransactionForm
					type={type}
					onTypeChange={setType}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
