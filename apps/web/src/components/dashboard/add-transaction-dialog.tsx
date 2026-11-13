import { Button } from "@cloudflare/kumo";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

/**
 * Dashboard "Add Transaction" entry point. The form itself lives in
 * `AddTransactionForm` so the mobile bottom-nav sheet can share it.
 */
export function AddTransactionDialog(): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<"expense" | "income">("expense");

	return (
		<>
			<Button
				variant="primary"
				icon={<PlusIcon size={16} />}
				onClick={() => setOpen(true)}
			>
				Add Transaction
			</Button>
			<ResponsiveDialog
				open={open}
				onOpenChange={setOpen}
				title={`Add ${type === "expense" ? "Expense" : "Income"}`}
			>
				<AddTransactionForm
					type={type}
					onTypeChange={setType}
					onSuccess={() => setOpen(false)}
				/>
			</ResponsiveDialog>
		</>
	);
}
