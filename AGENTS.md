# AGENTS.md - Moneta Development Guide

This file provides guidance for agentic coding agents operating in the Moneta repository.

## Project Overview

Moneta is a personal finance management web application built with:
- **Frontend**: React 19 + TanStack Router + Vite
- **Backend**: Hono (Node.js)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better-Auth
- **Styling**: TailwindCSS + shadcn/ui
- **Monorepo**: Turborepo with pnpm workspaces

## Available Commands

### Development

```bash
pnpm run dev              # Start all apps in development mode
pnpm run dev:web         # Start only frontend (port 3001)
pnpm run dev:server      # Start only backend (port 3000)
```

### Building

```bash
pnpm run build           # Build all apps
pnpm run dev:web         # Build web app
pnpm run dev:server      # Build server app
```

### Linting & Formatting

```bash
pnpm run check           # Run Biome check with auto-fix (recommended)
```

This command runs Biome with the following config:
- **Formatter**: Tab indentation, double quotes for JS
- **Linter**: Enabled with recommended rules + custom rules
- **Organize imports**: Auto-enabled

### Type Checking

```bash
pnpm run check-types     # TypeScript check across all apps
pnpm run -F web check-types   # Check types for web only
pnpm run -F server check-types # Check types for server only
```

### Database

```bash
pnpm run db:push         # Push schema changes to database
pnpm run db:generate     # Generate migrations
pnpm run db:migrate      # Run migrations
pnpm run db:studio       # Open Drizzle Studio
pnpm run db:seed         # Seed database
```

### Single App Commands

Use turbo filter to run commands for specific apps:

```bash
pnpm turbo -F web <command>
pnpm turbo -F server <command>
pnpm turbo -F @moneta/db <command>
pnpm turbo -F @moneta/auth <command>
```

Note: There are **no tests** in this codebase currently.

## Code Style Guidelines

### Formatting (Biome)

- **Indentation**: Tabs (not spaces)
- **JavaScript quotes**: Double quotes
- **Self-closing elements**: Use self-closing tags when possible
- **Single var declarator**: One variable per declaration

### TypeScript

- **Strict mode**: Enabled globally
- **Key conventions**:
  - Use `type` over `interface` for simple types
  - Use `interface` for object types that may be extended
  - Always define return types for functions
  - Enable `noUncheckedIndexedAccess`

### Imports

**Workspace packages** (use workspace protocol):
```typescript
import { db } from "@moneta/db";
import { auth } from "@moneta/auth";
```

**Path aliases** (web app):
```typescript
// @/ maps to apps/web/src/
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
```

**Import ordering** (via Biome auto-organize):
1. External libraries (React, TanStack, etc.)
2. Internal packages (@moneta/*)
3. Path aliases (@/)
4. Relative imports

### Naming Conventions

- **Components**: PascalCase (e.g., `TransactionTable.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useToast`)
- **Utilities**: camelCase (e.g., `cn.ts`)
- **Routes**: kebab-case (e.g., `expense.tsx`, `expense_.breakdown.tsx`)
- **Database schema**: snake_case (e.g., `expenses`, `userId`)

### Error Handling

**Server routes** (Hono + Zod):
```typescript
const schema = z.object({
  amount: z.string(),
  categoryId: z.number(),
});

app.post("/", async (c) => {
  const body = await c.req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  // proceed with result.data
});
```

**Client** (React Query + Toast):
```typescript
const mutation = useMutation({
  mutationFn: async (data) => await api.post("/api/endpoint", data),
  onError: (error: AxiosError<{ error: { message: string } }>) => {
    toast({
      title: "Error",
      description: error.response?.data?.error?.message || "Failed operation",
      variant: "destructive",
    });
  },
});
```

### React Patterns

**TanStack Router**:
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/path")({
  component: ComponentName,
});

function ComponentName() { }
```

**React Query**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["unique-key"],
  queryFn: async () => {
    const res = await api.get<ResponseType>("/api/endpoint");
    return res.data;
  },
});
```

**Component structure**:
- Use functional components with explicit return types
- Destructure props with TypeScript types
- Keep components under 200 lines when possible
- Extract forms and tables to separate components

### CSS & Tailwind

- Use Tailwind utility classes
- Use `cn()` from `@/lib/utils` for conditional classes
- Prefer semantic class names over arbitrary values
- Use shadcn/ui components as base

## Architecture

### Project Structure

```
moneta/
├── apps/
│   ├── web/           # Frontend (React + Vite)
│   └── server/        # Backend (Hono)
├── packages/
│   ├── db/            # Drizzle schema + queries
│   ├── auth/          # Better-Auth config
│   └── config/        # Shared TypeScript config
```

### API Routes (Hono)

Routes are in `apps/server/src/routes/`:
- `expenses.ts`, `incomes.ts` - CRUD operations
- `dashboard.ts` - Aggregated data
- `categories.ts` - Reference data
- `starting-balances.ts` - Initial balances

Pattern: Each route file exports a Hono app with type-safe variables.

### Frontend Routes (TanStack Router)

Routes use file-based routing in `apps/web/src/routes/`:
- `_authenticated/` - Protected routes layout
- `login.tsx` - Public auth page
- Files create routes at their path

## Database

### Schema Location

- Main schema: `packages/db/src/schema/moneta.ts`
- Auth schema: `packages/db/src/schema/auth.ts`
- Migrations: `packages/db/src/migrations/`

### Working with Schema

1. Edit schema files in `packages/db/src/schema/`
2. Run `pnpm run db:generate` to create migration
3. Run `pnpm run db:push` to apply changes

### Database Types

Import types from `@moneta/db`:
```typescript
import { expenses, categories } from "@moneta/db/schema/moneta";
```

## Important Notes

- Do not commit `.env` files or secrets
- Always run `pnpm run check` before committing
- Use `pnpm run check-types` to verify type safety
- Database migrations should be backwards compatible when possible
