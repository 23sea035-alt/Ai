import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Accepts either the root db handle or a transaction handle — for helpers that
// run inside or outside a db.transaction().
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export * from "./schema";
