import {
	ChartLineUpIcon,
	PiggyBankIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

const valueProps = [
	{
		icon: WalletIcon,
		title: "Income & expenses",
		description:
			"Track every transaction with categories that match your life.",
	},
	{
		icon: ChartLineUpIcon,
		title: "Visual progress",
		description: "Monthly charts and breakdowns that make trends easy to read.",
	},
	{
		icon: PiggyBankIcon,
		title: "Holdings included",
		description: "Cash, stocks, bonds and crypto in one personal ledger.",
	},
];

function BrandMark(): React.JSX.Element {
	return <Logo size="lg" />;
}

/**
 * Brand half of the split layout (`lg` and up). The old version painted two
 * blurred `bg-brand/10` circles over a gradient; the tint now comes from the
 * `--brand-subtle` token on the value-prop tiles instead, so there is no
 * opacity here that does not trace back to a decision (§2.1).
 */
function BrandPanel(): React.JSX.Element {
	return (
		<div className="relative hidden flex-col justify-between overflow-hidden border-kumo-hairline border-r bg-kumo-recessed p-10 lg:flex">
			<div>
				<BrandMark />
			</div>

			<div className="relative max-w-md space-y-4">
				<p className="font-medium text-kumo-brand text-xs uppercase tracking-widest">
					Personal finance, simply put
				</p>
				<h2 className="font-semibold text-3xl text-kumo-strong leading-tight tracking-tight">
					Understand your money with calm, clear numbers.
				</h2>
				<ul className="space-y-4 pt-4">
					{valueProps.map(({ icon: Icon, title, description }) => (
						<li key={title} className="flex gap-3">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-kumo-brand">
								<Icon size={20} aria-hidden="true" />
							</span>
							<span className="space-y-0.5">
								<span className="block font-medium text-base">{title}</span>
								<span className="block text-kumo-subtle text-sm">
									{description}
								</span>
							</span>
						</li>
					))}
				</ul>
			</div>

			<p className="relative text-kumo-subtle text-sm">
				© {new Date().getFullYear()} Moneta
			</p>
		</div>
	);
}

function RouteComponent(): React.JSX.Element {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="grid min-h-svh grid-cols-1 bg-kumo-base lg:grid-cols-2">
			<BrandPanel />

			<div className="flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:justify-center lg:px-10">
				<div className="lg:hidden">
					<BrandMark />
				</div>

				<div className="flex flex-1 items-center justify-center py-4 lg:flex-none lg:py-0">
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
