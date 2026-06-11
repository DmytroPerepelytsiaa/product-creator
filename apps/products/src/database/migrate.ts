import "dotenv/config";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Standalone migration runner. Used both locally (`pnpm db:migrate:dev`) and
 * inside the container before the service starts (`node dist/database/migrate.js`),
 * so it relies only on runtime deps — never on drizzle-kit.
 */
async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  // Migrations live next to the compiled file in dist, and at ../../drizzle in src.
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
