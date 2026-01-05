import { createFileRoute } from "@tanstack/react-router";
import { CategorySettings } from "@/components/category-settings";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8 space-y-0.5">
				<h1 className="font-bold text-3xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your account settings and transaction categories.
				</p>
			</div>

			<Separator className="my-6" />

			<div className="flex flex-col space-y-8">
				<section>
					<CategorySettings />
				</section>

				{/* Future settings sections can be added here */}
			</div>
		</div>
	);
}
