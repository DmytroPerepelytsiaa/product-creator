import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "./schema";

/** Injection token for the Drizzle database instance. */
export const DRIZZLE = Symbol("DRIZZLE");

/** Injection token for the underlying pg connection pool. */
export const DATABASE_POOL = Symbol("DATABASE_POOL");

/** Strongly-typed Drizzle client bound to our schema. */
export type Database = NodePgDatabase<typeof schema>;
