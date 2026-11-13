import { LayerDialog } from "@cloudflare/kumo/components/layer-dialog";
import type * as React from "react";

type ResponsiveDialogSize = "sm" | "base" | "lg" | "xl";

type ResponsiveDialogAction = {
	label: string;
	onClick: () => void;
	/** `destructive` for irreversible confirmations (docs/design.md §7.6). */
	variant?: "primary" | "destructive";
	loading?: boolean;
	disabled?: boolean;
};

type ResponsiveDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Required: kumo wires it to `aria-labelledby`. */
	title: string;
	description?: string;
	size?: ResponsiveDialogSize;
	children?: React.ReactNode;
	/**
	 * The right-hand action. The left-hand dismiss button is automatic
	 * (docs/design.md §7.6: secondary left, primary right).
	 */
	action?: ResponsiveDialogAction;
	/** Label of the automatic dismiss button. Defaults to kumo's "Close". */
	dismissLabel?: string;
	/** Extra actions exposed from a split-button menu next to the primary. */
	menu?: React.ReactNode[];
};

/**
 * The only modal in Moneta (decision D11): kumo `LayerDialog`, which is a
 * centered dialog at `>=md` and a swipeable bottom sheet below it — built on
 * Base UI's Drawer. Drag handle, safe-area padding, focus trap, Esc/overlay
 * dismissal and reduced-motion all come from the primitive; call sites never
 * branch on viewport.
 *
 * @example
 * <ResponsiveDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Add expense"
 *   size="base"
 *   action={{ label: "Save", onClick: submit, loading: isPending }}
 * >
 *   <ExpenseForm />
 * </ResponsiveDialog>
 */
export function ResponsiveDialog({
	open,
	onOpenChange,
	title,
	description,
	size = "base",
	children,
	action,
	dismissLabel,
	menu,
}: ResponsiveDialogProps): React.JSX.Element {
	return (
		<LayerDialog.Root open={open} onOpenChange={onOpenChange}>
			<LayerDialog.Content size={size} verticalAlign="center">
				<LayerDialog.Title>{title}</LayerDialog.Title>
				{description ? (
					<LayerDialog.Description>{description}</LayerDialog.Description>
				) : null}
				{/* kumo requires exactly one Title and one Body, so Body is always rendered. */}
				<LayerDialog.Body>{children}</LayerDialog.Body>
				{action ? (
					<LayerDialog.Actions dismissLabel={dismissLabel}>
						<LayerDialog.Action
							variant={action.variant ?? "primary"}
							loading={action.loading}
							disabled={action.disabled}
							onClick={action.onClick}
							menu={menu}
						>
							{action.label}
						</LayerDialog.Action>
					</LayerDialog.Actions>
				) : null}
			</LayerDialog.Content>
		</LayerDialog.Root>
	);
}
