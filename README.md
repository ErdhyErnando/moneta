# Moneta

Moneta is a personal finance management web application designed for individual use. The primary objective is to provide a fast, efficient, and user-friendly tool for tracking income and expenses, visualizing financial health, and gaining insights into spending habits.

This project is built for tech-savvy individuals who prefer a simple, self-hosted solution for privacy and control over their financial data.

## ✨ Core Features

-   **User Authentication:** Secure user authentication and authorization using email and password.
-   **Dashboard:** A comprehensive dashboard with financial summaries and data visualizations (bar charts, line charts).
-   **Filtering:** Filter dashboard data by weekly, monthly, and yearly views.
-   **Income Management:** A dedicated page to add and view income entries with categories.
-   **Expense Management:** A dedicated page to add and view expense entries with categories.
-   **Predefined Categories:** A set of predefined categories for income and expenses.

## 🚀 Technology Stack

-   **TypeScript** - For type safety and improved developer experience
-   **React** - For building the user interface
-   **TanStack Router** - File-based routing with full type safety
-   **TailwindCSS** - Utility-first CSS for rapid UI development
-   **shadcn/ui** - Reusable UI components
-   **Recharts** - For data visualization
-   **Hono** - Lightweight, performant server framework for the backend API
-   **Node.js** - Runtime environment
-   **Drizzle** - TypeScript-first ORM
-   **PostgreSQL** - Database engine
-   **Authentication** - Better-Auth
-   **Biome** - Linting and formatting
-   **PWA** - Progressive Web App support
-   **Turborepo** - Optimized monorepo build system

## 📦 Project Structure

```
moneta/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── api/         # tRPC API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher)
-   [pnpm](https://pnpm.io/installation)
-   [PostgreSQL](https://www.postgresql.org/download/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/moneta.git
    cd moneta
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```

## 🗄️ Database Setup

This project uses PostgreSQL with Drizzle ORM.

1.  Make sure you have a PostgreSQL database server running.
2.  Create a new database for the project.
3.  Copy the `.env.example` file in `apps/server` to a new file named `.env`.
    ```bash
    cp apps/server/.env.example apps/server/.env
    ```
4.  Update your `apps/server/.env` file with your PostgreSQL connection details.
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
5.  Apply the schema to your database:
    ```bash
    pnpm run db:push
    ```

## 🚀 Running the Application

Run the development server:

```bash
pnpm run dev
```

-   The web application will be available at [http://localhost:5173](http://localhost:5173).
-   The API server will be running at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

-   `pnpm run dev`: Start all applications in development mode
-   `pnpm run build`: Build all applications
-   `pnpm run dev:web`: Start only the web application
-   `pnpm run dev:server`: Start only the server
-   `pnpm run check-types`: Check TypeScript types across all apps
-   `pnpm run db:push`: Push schema changes to the database
-   `pnpm run db:studio`: Open Drizzle Studio to view and manage your data
-   `pnpm run format`: Format the code using Biome
-   `pnpm run lint`: Lint the code using Biome
-   `pnpm run check`: Run both formatting and linting
-   `cd apps/web && pnpm run generate-pwa-assets`: Generate PWA assets

## 🌐 API Endpoints

A brief overview of the available API endpoints.

### Authentication

-   `POST /auth/sign-in`: User login.
-   `POST /auth/sign-out`: User logout.

### Income Management

-   `GET /api/incomes`: Get all income records for the authenticated user.
-   `POST /api/incomes`: Add a new income record.

### Expense Management

-   `GET /api/expenses`: Get all expense records for the authenticated user.
-   `POST /api/expenses`: Add a new expense record.

### Category Management

-   `GET /api/categories`: Get all predefined categories.

## 🚀 Deployment

The application is designed to be deployed to a personal VPS using [Dokploy](https://dokploy.com/).