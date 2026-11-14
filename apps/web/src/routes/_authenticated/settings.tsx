import { LayerCard, Select } from "@cloudflare/kumo";
import { createFileRoute } from "@tanstack/react-router";
import { CategorySettings } from "@/components/category-settings";
import { PageContainer, PageHeader, Section } from "@/components/layout";
import {
	CURRENCIES,
	type CurrencyCode,
	useCurrency,
} from "@/contexts/currency-context";

export const Route = createFileRoute("/_authenticated/settings")({
	component: SettingsPage,
});

function SettingsPage(): React.JSX.Element {
	const { currency, setCurrency } = useCurrency();

	return (
		<PageContainer width="narrow">
			<PageHeader
				title="Settings"
				description="Preferences and the categories your records are labelled with."
			/>

			<div className="space-y-6">
				<Section title="Preferences">
					<LayerCard className="rounded-xl p-6 shadow-none">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0 space-y-1">
								<div className="font-medium text-base">Display currency</div>
								<p className="text-kumo-subtle text-sm">
									Every amount in the app is shown in this currency. The choice
									is stored on this device.
								</p>
							</div>
							<Select
								aria-label="Display currency"
								className="w-full max-md:h-11 sm:w-48"
								value={currency.code}
								onValueChange={(value) => {
									if (value) setCurrency(value as CurrencyCode);
								}}
								items={Object.values(CURRENCIES).map((curr) => ({
									label: `${curr.code} — ${curr.name}`,
									value: curr.code,
								}))}
							/>
						</div>
					</LayerCard>
				</Section>

				<CategorySettings />
			</div>
		</PageContainer>
	);
}
