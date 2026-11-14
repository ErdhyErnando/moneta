import { Button } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { CheckIcon, CoinsIcon } from "@phosphor-icons/react";
import {
	CURRENCIES,
	type CurrencyCode,
	useCurrency,
} from "@/contexts/currency-context";

/**
 * Currency switcher (secondary control, §7.3).
 *
 * The trigger shows the ISO code at every width. It used to swap to the bare
 * symbol below `sm` next to a dollar-sign icon, so USD rendered as "$ $" and
 * two different currencies could look identical; the code is unique.
 */
export function CurrencySelector(): React.JSX.Element {
	const { currency, setCurrency } = useCurrency();

	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="secondary"
					size="sm"
					className="max-md:h-11"
					icon={<CoinsIcon size={16} className="max-sm:hidden" />}
					aria-label={`Currency, currently ${currency.code}`}
				>
					{currency.code}
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" className="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Label>Select currency</DropdownMenu.Label>
					{Object.values(CURRENCIES).map((curr) => (
						<DropdownMenu.Item
							key={curr.code}
							onClick={() => setCurrency(curr.code as CurrencyCode)}
							className="justify-between gap-2"
						>
							<span className="truncate">
								<span className="text-kumo-subtle">{curr.code}</span>{" "}
								{curr.name}
							</span>
							{currency.code === curr.code ? (
								<CheckIcon size={16} className="text-kumo-brand" />
							) : null}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}
