import { Button } from "@cloudflare/kumo";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

type AddTransactionDialogProps = {
	/** Layout-only override on the trigger (e.g. `max-md:hidden`). */
	className?: string;
};

/**
 * Dashboard "Add Transaction" entry point — the view's single primary CTA.
 * The form itself lives in `AddTransactionForm` so the mobile bottom-nav sheet
 * can share it. Opens as a centered dialog at `>=md` and a bottom sheet below
 * it (ResponsiveDialog, decision D11).
 */
export function AddTransactionDialog({
	className,
}: AddTransactionDialogProps): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const [type, setType] = useState<"expense" | "income">("expense");

	return (
		<>
			<Button
				variant="primary"
				icon={<PlusIcon size={16} />}
				onClick={() => setOpen(true)}
				className={className}
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
