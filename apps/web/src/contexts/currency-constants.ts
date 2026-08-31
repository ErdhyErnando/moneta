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
