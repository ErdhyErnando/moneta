import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	CURRENCIES,
	type Currency,
	type CurrencyCode,
} from "./currency-constants";

// re-export for external consumers (keeps import path stable)
export type { Currency, CurrencyCode } from "./currency-constants";
export { CURRENCIES } from "./currency-constants";

interface CurrencyContextType {
	currency: Currency;
	setCurrency: (code: CurrencyCode) => void;
	formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
	undefined,
);

// Hoisted Intl formatters per #25 js-hoist-intl
const FORMATTERS = new Map<string, Intl.NumberFormat>();
function getFormatter(currency: Currency): Intl.NumberFormat {
	if (!FORMATTERS.has(currency.code)) {
		FORMATTERS.set(
			currency.code,
			new Intl.NumberFormat(currency.locale, {
				style: "currency",
				currency: currency.code,
				minimumFractionDigits:
					currency.code === "IDR" || currency.code === "JPY" ? 0 : 2,
				maximumFractionDigits:
					currency.code === "IDR" || currency.code === "JPY" ? 0 : 2,
			}),
		);
	}
	return FORMATTERS.get(currency.code)!;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
	const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
		// Load from localStorage or default to USD
		try {
			const stored = localStorage.getItem("currency");
			if (stored && stored in CURRENCIES) {
				return stored as CurrencyCode;
			}
		} catch (error) {
			// localStorage is unavailable (e.g., private browsing mode)
			console.warn("Failed to access localStorage:", error);
		}
		return "USD";
	});

	const currency = CURRENCIES[currencyCode];

	useEffect(() => {
		// Persist to localStorage whenever currency changes
		try {
			localStorage.setItem("currency", currencyCode);
		} catch (error) {
			// localStorage is unavailable (e.g., private browsing mode)
			console.warn("Failed to save currency to localStorage:", error);
		}
	}, [currencyCode]);

	const formatCurrency = useCallback(
		(amount: number) => getFormatter(currency).format(amount),
		[currency],
	);

	const value = useMemo(
		() => ({ currency, setCurrency: setCurrencyCode, formatCurrency }),
		[currency, formatCurrency],
	);

	return (
		<CurrencyContext.Provider value={value}>
			{children}
		</CurrencyContext.Provider>
	);
}

export function useCurrency() {
	const context = useContext(CurrencyContext);
	if (context === undefined) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
}
