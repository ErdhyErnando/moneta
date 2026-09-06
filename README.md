# Moneta

Moneta is a personal finance management web application designed designed and develop with the plan of testing google's Antigravity. The primary objective is to provide a fast, efficient, and user-friendly tool for tracking income and expenses, visualizing financial health, and gaining insights into spending habits. (not really i just want to see the capabilities of gemini 3 pro 😝)

Built for tech-savvy folks who want a simple, self-hosted money tracker they actually control — your data lives in your own Postgres, not in someone else's cloud. (non tech-savvy could use it too)

## 📸 Screenshots

> Screenshots live in [`docs/screenshots/`](docs/screenshots/) — drop a PNG in there and it shows up below.

![Dashboard](docs/screenshots/dashboard.png)

## ✨ Core Features

- **User Authentication:** Email + password sign-up/sign-in with sessions (Better-Auth), protected routes included.
- **Dashboard:** Summary cards (income, expenses, net + current balance), cash-flow area chart, category pie, monthly income/expense bars with year picker, and recent transactions.
- **Time Ranges:** Slice the dashboard by last 7 / 30 / 90 days or a custom date range.
- **Income & Expense Management:** Filterable, sortable, paginated tables with a column chooser, add/edit/delete dialogs, and per-type breakdown pages with charts.
- **Assets Ledger:** Track holdings (stocks, bonds, cash, crypto, …) grouped by type with totals, a chart, and full CRUD.
- **Starting Balances:** Set opening balances so the numbers actually add up from day one.
- **Categories:** Custom categories with colors, per-type tabs, plus archive/restore instead of scary hard deletes.
- **Multi-currency Display:** Currency selector for viewing amounts your way.
- **Dark Mode:** Light / dark / system theme with a sidebar toggle.
- **PWA:** Installable, works like a native-ish app on desktop and mobile.

## 🚀 Technology Stack

- **TypeScript** - For type safety and improved developer experience
- **React 19 + Vite** - UI + dev server / build (port 3001)
- **TanStack Router / Query / Table / Form** - File-based routing, server state, tables, forms
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Recharts** - Charts, lazy-loaded so the first paint stays snappy
- **Hono (Node.js)** - Lightweight backend API (port 3000)
- **Drizzle + PostgreSQL** - TypeScript-first ORM + database engine
- **Better-Auth** - Authentication
- **Biome** - Linting and formatting
- **Turborepo + pnpm** - Monorepo build system + package manager

## 📦 Project Structure

```
moneta/
├── apps/
│   ├── web/         # Frontend (React 19 + Vite + TanStack Router)
│   └── server/      # Backend API (Hono, Dockerfile included)
├── packages/
│   ├── auth/        # Better-Auth configuration & logic
│   ├── config/      # Shared TypeScript config
│   └── db/          # Drizzle schema, migrations & queries
└── docs/
    └── screenshots/ # README screenshots live here
```

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v22.13 or higher)
- [pnpm](https://pnpm.io/installation) (v11)
- [PostgreSQL](https://www.postgresql.org/download/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ErdhyErnando/moneta.git
    cd moneta
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```
3.  Configure the backend — copy the example env and fill it in:
    ```bash
    cp apps/server/.env.example apps/server/.env
    ```
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    BETTER_AUTH_SECRET="something-long-and-random"
    BETTER_AUTH_URL="http://localhost:3000"
    CORS_ORIGIN="http://localhost:3001"
    ```
4.  Point the web app at the API (optional for local dev, defaults to `http://localhost:3000`):
    ```bash
    cp apps/web/.env.example apps/web/.env
    ```
    ```env
    VITE_SERVER_URL="http://localhost:3000"
    ```

## 🗄️ Database Setup

This project uses PostgreSQL with Drizzle ORM.

1.  Make sure you have a PostgreSQL database server running.
2.  Create a new database for the project.
3.  Push the schema to your database:
    ```bash
    pnpm run db:push
    ```
    (Migrations workflow: `pnpm run db:generate` then `pnpm run db:migrate`. Peek at the data anytime with `pnpm run db:studio`, or load demo data with `pnpm run db:seed`.)

## 🚀 Running the Application

Run everything in development mode:

```bash
pnpm run dev
```

- The web application will be available at [http://localhost:3001](http://localhost:3001).
- The API server will be running at [http://localhost:3000](http://localhost:3000).

Run only what you need: `pnpm run dev:web` (frontend) or `pnpm run dev:server` (backend).

## 📜 Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the API server
- `pnpm run build`: Build all applications
- `pnpm run check`: Biome check with auto-fix (run this before committing, pretty please)
- `pnpm run check-types`: TypeScript check across all apps
- `pnpm run db:push`: Push schema changes to the database
- `pnpm run db:generate`: Generate a migration from schema changes
- `pnpm run db:migrate`: Run pending migrations
- `pnpm run db:studio`: Open Drizzle Studio to view and manage your data
- `pnpm run db:seed`: Seed the database with demo data
- `cd apps/web && pnpm run generate-pwa-assets`: Regenerate PWA icons/splash assets

## 🌐 API Endpoints

Brief overview — everything under `/api` needs an authenticated session (cookie-based).

- **Auth:** handled by Better-Auth (sign-up / sign-in / sign-out / session).
- **Incomes / Expenses:** `GET /api/incomes`, `POST /api/incomes`, `PUT /api/incomes/:id`, `DELETE /api/incomes/:id` (same shape for `/api/expenses`).
- **Assets:** `GET /api/assets`, `POST /api/assets`, `PUT /api/assets/:id`, `DELETE /api/assets/:id`.
- **Starting balances:** `GET /api/starting-balances`, `POST /api/starting-balances`, `PUT /api/starting-balances/:id`, `DELETE /api/starting-balances/:id`.
- **Categories:** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` (archive), `POST /api/categories/:id/restore`.
- **Dashboard:** `GET /api/dashboard/summary`, `/transactions`, `/chart`, `/expense-categories`, `/income-categories`, `/monthly-expenses`, `/monthly-income` (all accept `startDate`/`endDate`, monthly ones take `year`).

## 🚀 Deployment

The application is designed to be deployed to a personal VPS using [Dokploy](https://dokploy.com/). The server ships with a `Dockerfile`, and pushes to `main` touching `apps/server/**` (or shared packages) automatically build + push an image to GHCR via [`.github/workflows/deploy-server.yml`](.github/workflows/deploy-server.yml). The web app is a static Vite build (`pnpm --filter web build`) — serve `apps/web/dist` behind anything you like.
