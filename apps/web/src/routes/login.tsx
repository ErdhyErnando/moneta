import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, PiggyBank, Wallet } from "lucide-react";
import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

const valueProps = [
	{
		icon: Wallet,
		title: "Income & expenses",
		description:
			"Track every transaction with categories that match your life.",
	},
	{
		icon: AreaChart,
		title: "Visual progress",
		description: "Monthly charts and breakdowns that make trends easy to read.",
	},
	{
		icon: PiggyBank,
		title: "Holdings included",
		description: "Cash, stocks, bonds and crypto in one personal ledger.",
	},
];

function BrandPanel() {
	return (
		<div className="relative hidden flex-col justify-between overflow-hidden bg-muted p-10 lg:flex dark:border-sidebar-border dark:border-r">
			{/* kumo-inspired warm accents */}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-transparent" />
			<div className="-top-24 -right-24 pointer-events-none absolute size-96 rounded-full bg-brand-accent/10 blur-3xl" />
			<div className="-bottom-32 -left-24 pointer-events-none absolute size-96 rounded-full bg-brand-accent/5 blur-3xl" />

			<div className="relative flex items-center gap-2">
				<img src="/logo.png" alt="Moneta logo" className="size-8 rounded-md" />
				<h2 className="font-bold text-xl tracking-tight">Moneta</h2>
			</div>

			<div className="relative max-w-md">
				<p className="font-semibold text-brand-accent-strong text-xs uppercase tracking-widest dark:text-brand-accent">
					Personal finance, simply put
				</p>
				<h1 className="mt-4 font-bold text-4xl leading-tight tracking-tight">
					Understand your money with calm, clear numbers.
				</h1>
				<ul className="mt-10 space-y-6">
					{valueProps.map(({ icon: Icon, title, description }) => (
						<li key={title} className="flex gap-4">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
								<Icon className="size-5" aria-hidden="true" />
							</div>
							<div>
								<p className="font-semibold">{title}</p>
								<p className="mt-0.5 text-muted-foreground text-sm">
									{description}
								</p>
							</div>
						</li>
					))}
				</ul>
			</div>

			<p className="relative text-muted-foreground text-sm">
				© {new Date().getFullYear()} Moneta
			</p>
		</div>
	);
}

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<BrandPanel />
			<div className="flex flex-col gap-6 p-6 md:p-10">
				<div className="flex items-center justify-center gap-2 lg:hidden">
					<img
						src="/logo.png"
						alt="Moneta logo"
						className="size-8 rounded-md"
					/>
					<h2 className="font-bold text-xl tracking-tight">Moneta</h2>
				</div>
				<div className="flex flex-1 items-center justify-center py-8">
					<div className="w-full max-w-sm">
						{showSignIn ? (
							<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
						) : (
							<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
