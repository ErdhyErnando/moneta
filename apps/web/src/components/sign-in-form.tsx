import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { AuthField } from "./auth-field";
import Loader from "./loader";
import { Button } from "./ui/button";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
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
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
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
				<h1 className="font-bold text-2xl tracking-tight">Welcome back</h1>
				<p className="text-muted-foreground text-sm">
					Sign in to your Moneta account
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
					<form.Field name="email">
						{(field) => (
							<AuthField field={field} label="Email" type="email" autoComplete="email" />
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="password">
						{(field) => (
							<AuthField field={field} label="Password" type="password" autoComplete="current-password" />
						)}
					</form.Field>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!state.canSubmit || state.isSubmitting}
						>
							{state.isSubmitting ? "Submitting..." : "Sign In"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<div className="text-center">
				<Button
					variant="link"
					onClick={onSwitchToSignUp}
					className="text-primary hover:text-primary/80"
				>
					Need an account? Sign up
				</Button>
			</div>
		</div>
	);
}
