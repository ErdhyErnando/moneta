import { IconCurrencyDollar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CURRENCIES,
	type CurrencyCode,
	useCurrency,
} from "@/contexts/currency-context";

export function CurrencySelector() {
	const { currency, setCurrency } = useCurrency();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<IconCurrencyDollar className="size-4" />
					<span className="hidden sm:inline">{currency.code}</span>
					<span className="sm:hidden">{currency.symbol}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Select Currency</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{Object.values(CURRENCIES).map((curr) => (
					<DropdownMenuItem
						key={curr.code}
						onClick={() => setCurrency(curr.code as CurrencyCode)}
						className="flex items-center justify-between"
					>
						<span>
							{curr.symbol} {curr.name}
						</span>
						{currency.code === curr.code && (
							<span className="text-primary">✓</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
