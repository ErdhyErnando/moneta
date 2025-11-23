import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const { data: session } = await authClient.getSession();
		if (!session) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: Outlet,
});
