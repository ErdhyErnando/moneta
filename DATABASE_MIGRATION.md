# Database Migration SQL Commands

## Overview
These SQL commands need to be executed to add the Starting Balance feature to your Moneta app.

## Step 1: Extend Category Type Enum

```sql
-- Add 'starting_balance' to the category_type enum
ALTER TYPE category_type ADD VALUE 'starting_balance';
```

> **Note:** This command cannot be run inside a transaction block. Execute it separately.

---

## Step 2: Create Starting Balances Table

```sql
-- Create the starting_balances table
CREATE TABLE starting_balances (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_starting_balances_user_id ON starting_balances(user_id);
CREATE INDEX idx_starting_balances_date ON starting_balances(date);
```

---

## Step 3: Create Default Categories

```sql
-- Insert default starting balance categories
INSERT INTO categories (name, type) VALUES 
    ('Savings', 'starting_balance'),
    ('Cash on Hand', 'starting_balance');
```

---

## Verification

After running the migrations, verify the changes:

```sql
-- Check if enum was extended
SELECT unnest(enum_range(NULL::category_type));

-- Check if table was created
\d starting_balances

-- Check if categories were created
SELECT * FROM categories WHERE type = 'starting_balance';
```

---

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Drop the table
DROP TABLE IF EXISTS starting_balances CASCADE;

-- Delete the categories
DELETE FROM categories WHERE type = 'starting_balance';

-- Note: You cannot remove a value from an enum in PostgreSQL
-- You would need to recreate the enum type if rollback is required
```

---

## After Migration

After running these SQL commands:

1. Run Drizzle generate command to sync the schema:
   ```bash
   npm run db:generate
   ```

2. The schema changes in `packages/db/src/schema/moneta.ts` are already updated

3. Backend API endpoints still need to be created (next step)
