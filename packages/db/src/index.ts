import { drizzle } from "drizzle-orm/node-postgres";
import * as auth from "./schema/auth";
import * as moneta from "./schema/moneta";

export const schema = { ...auth, ...moneta };
export const db = drizzle(process.env.DATABASE_URL || "", { schema });
