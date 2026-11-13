import { ResponsiveDialog } from "@/components/responsive-dialog";

type DeleteConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onConfirm: () => void;
	pending: boolean;
	confirmLabel?: string;
	pendingLabel?: string;
};

// Shared delete confirmation dialog for the assets / expense / income pages (#49).
export function DeleteConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	pending,
	confirmLabel = "Delete",
	pendingLabel = "Deleting...",
}: DeleteConfirmDialogProps): React.JSX.Element {
	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			title={title}
			description={description}
			size="sm"
			dismissLabel="Cancel"
			action={{
				label: pending ? pendingLabel : confirmLabel,
				onClick: onConfirm,
				variant: "destructive",
				loading: pending,
			}}
		/>
	);
}
