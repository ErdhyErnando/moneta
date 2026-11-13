import { Button } from "@cloudflare/kumo";
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown";
import { CurrencyDollarIcon } from "@phosphor-icons/react";
import {
	CURRENCIES,
	type CurrencyCode,
	useCurrency,
} from "@/contexts/currency-context";

export function CurrencySelector(): React.JSX.Element {
	const { currency, setCurrency } = useCurrency();

	return (
		<DropdownMenu>
			<DropdownMenu.Trigger>
				<Button
					variant="secondary"
					size="sm"
					icon={<CurrencyDollarIcon size={16} />}
				>
					<span className="hidden sm:inline">{currency.code}</span>
					<span className="sm:hidden">{currency.symbol}</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" className="w-56">
				<DropdownMenu.Label>Select Currency</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{Object.values(CURRENCIES).map((curr) => (
					<DropdownMenu.Item
						key={curr.code}
						onClick={() => setCurrency(curr.code as CurrencyCode)}
						className="justify-between"
					>
						<span>
							{curr.symbol} {curr.name}
						</span>
						{currency.code === curr.code && (
							<span className="text-brand-strong">✓</span>
						)}
					</DropdownMenu.Item>
				))}
			</DropdownMenu.Content>
		</DropdownMenu>
	);
}
