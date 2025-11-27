import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "IDR" | "JPY" | "CNY";

export interface Currency {
	code: CurrencyCode;
	symbol: string;
	name: string;
	locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
	USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
	EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
	GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
	IDR: {
		code: "IDR",
		symbol: "Rp",
		name: "Indonesian Rupiah",
		locale: "id-ID",
	},
	JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
	CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
};

interface CurrencyContextType {
	currency: Currency;
	setCurrency: (code: CurrencyCode) => void;
	formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
	undefined,
);

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

	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat(currency.locale, {
			style: "currency",
			currency: currency.code,
			minimumFractionDigits:
				currency.code === "IDR" || currency.code === "JPY" ? 0 : 2,
			maximumFractionDigits:
				currency.code === "IDR" || currency.code === "JPY" ? 0 : 2,
		}).format(amount);
	};

	return (
		<CurrencyContext.Provider
			value={{
				currency,
				setCurrency: setCurrencyCode,
				formatCurrency,
			}}
		>
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
