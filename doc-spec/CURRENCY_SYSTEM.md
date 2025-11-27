# Currency Selection System

## Overview
A comprehensive currency selection system has been implemented that allows users to choose their preferred currency throughout the application. The selected currency persists across sessions using localStorage.

## Features

### Supported Currencies
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **IDR** - Indonesian Rupiah (Rp)
- **JPY** - Japanese Yen (¥)
- **CNY** - Chinese Yuan (¥)

### Components Created

#### 1. Currency Context (`src/contexts/currency-context.tsx`)
- Manages global currency state
- Provides `useCurrency()` hook for accessing currency functions
- Persists selection to localStorage
- Handles currency formatting with proper locale support

#### 2. Currency Selector (`src/components/currency-selector.tsx`)
- Dropdown component for selecting currency
- Shows currency code on desktop, symbol on mobile
- Visual checkmark for selected currency
- Integrated into dashboard, income, and expense pages

### Usage

#### In Components
```tsx
import { useCurrency } from "@/contexts/currency-context";

function MyComponent() {
  const { formatCurrency, currency, setCurrency } = useCurrency();
  
  // Format a number as currency
  const formatted = formatCurrency(1234.56);
  // Output depends on selected currency:
  // USD: "$1,234.56"
  // EUR: "1.234,56 €"
  // IDR: "Rp1.235" (no decimals)
  
  return <div>{formatted}</div>;
}
```

#### Currency Selector Placement
The `<CurrencySelector />` component has been added to:
- Dashboard header (`/`)
- Income page header (`/income`)
- Expense page header (`/expense`)

### Files Modified

1. **`src/main.tsx`** - Added CurrencyProvider wrapper
2. **`src/routes/_authenticated/index.tsx`** - Dashboard with currency support
3. **`src/routes/_authenticated/income.tsx`** - Income page with currency support
4. **`src/routes/_authenticated/expense.tsx`** - Expense page with currency support
5. **`src/components/data-table.tsx`** - Data table with dynamic currency formatting
6. **`src/components/chart-area-interactive.tsx`** - Chart with distinct colors for income (green) and expense (red)

### Technical Details

#### Locale-Aware Formatting
The system uses `Intl.NumberFormat` with appropriate locales for each currency:
- Automatically handles decimal places (0 for IDR/JPY, 2 for others)
- Respects regional number formatting conventions
- Properly positions currency symbols

#### State Management
- Currency selection is stored in `localStorage` with key `"currency"`
- Default currency is USD if no selection exists
- Changes are immediately reflected across all components using the hook

### Future Enhancements
Consider adding:
- More currencies (AUD, CAD, SGD, etc.)
- Currency conversion rates
- Multi-currency support (display amounts in multiple currencies)
- User preference settings page
