import { Banner, Button } from "@cloudflare/kumo";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import Loader from "./loader";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}): React.JSX.Element {
	const navigate = useNavigate({ from: "/" });
	const { isPending } = authClient.useSession();
	const { toast } = useToast();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setFormError(null);
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/",
						});
						toast({ title: "Sign in successful" });
					},
					onError: (error) => {
						// Auth failures belong next to the form (§7.8): a toast
						// disappears and leaves the user staring at filled-in fields.
						setFormError(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-semibold text-2xl text-kumo-strong tracking-tight">
					Welcome back
				</h1>
				<p className="text-kumo-subtle text-sm">
					Sign in to your Moneta account.
				</p>
			</div>

			{formError ? (
				<Banner
					variant="error"
					icon={<WarningCircleIcon size={16} />}
					title="Could not sign you in"
					description={formError}
				/>
			) : null}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="email">
					{(field) => (
						<AuthField
							field={field}
							label="Email"
							type="email"
							autoComplete="email"
						/>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<AuthField
							field={field}
							label="Password"
							type="password"
							autoComplete="current-password"
						/>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="w-full"
							disabled={!state.canSubmit}
							loading={state.isSubmitting}
						>
							Sign in
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="flex flex-wrap items-center justify-center gap-1">
				<span className="text-kumo-subtle text-sm">Need an account?</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={onSwitchToSignUp}
					className="text-kumo-brand"
				>
					Sign up
				</Button>
			</div>
		</div>
	);
}
