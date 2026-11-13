import { Button } from "@cloudflare/kumo";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import Loader from "./loader";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();
	const { toast } = useToast();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/",
						});
						toast({ title: "Sign up successful" });
					},
					onError: (error) => {
						toast({
							title: "Error",
							description: error.error.message || error.error.statusText,
							variant: "destructive",
						});
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
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
				<h1 className="font-bold text-2xl tracking-tight">Create account</h1>
				<p className="text-muted-foreground text-sm">
					Start tracking your finances in minutes
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<div>
					<form.Field name="name">
						{(field) => (
							<AuthField field={field} label="Name" autoComplete="name" />
						)}
					</form.Field>
				</div>

				<div>
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
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<AuthField
								field={field}
								label="Password"
								type="password"
								autoComplete="new-password"
							/>
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign Up"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="text-center">
				<Button
					variant="ghost"
					onClick={onSwitchToSignIn}
					className="text-brand-strong"
				>
					Already have an account? Sign in
				</Button>
			</div>
		</div>
	);
}
