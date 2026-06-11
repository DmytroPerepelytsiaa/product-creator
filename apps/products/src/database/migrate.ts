import "dotenv/config";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Standalone runner used both locally and in the container; relies only on
// runtime deps (drizzle-orm), never on drizzle-kit.
async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  // Resolves to apps/products/drizzle from both src (tsx) and dist (node).
  const migrationsFolder = path.resolve(__dirname, "../../drizzle");

  console.log(`Applying migrations from ${migrationsFolder} ...`);
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");

  await pool.end();
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
