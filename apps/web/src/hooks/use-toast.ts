import { useKumoToastManager } from "@cloudflare/kumo/components/toast";
import * as React from "react";

/**
 * Toast adapter over kumo's `Toasty` provider (docs/design.md §7.7).
 *
 * Call sites keep the `toast({ title, description, variant })` shape they have
 * used since the shadcn days, so migrating the primitive is a one-file change.
 * `variant: "destructive"` maps to kumo's `error` variant; everything else is
 * the default toast.
 */
type ToastInput = {
	title?: React.ReactNode;
	description?: React.ReactNode;
	variant?: "default" | "destructive";
};

type ToastApi = {
	toast: (input: ToastInput) => void;
};

export function useToast(): ToastApi {
	const manager = useKumoToastManager();

	const toast = React.useCallback(
		({ title, description, variant }: ToastInput) => {
			manager.add({
				title: typeof title === "string" ? title : undefined,
				description: typeof description === "string" ? description : undefined,
				variant: variant === "destructive" ? "error" : "default",
			});
		},
		[manager],
	);

	return { toast };
}
