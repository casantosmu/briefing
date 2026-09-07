import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Client } from "pg";

import type { Logger } from "../core/logger.js";

const LOCK_NAME = "briefing:application_migrations";

interface MigrationRow {
  filename: string;
  checksum: string;
}

interface LockReleaseRow {
  unlocked: boolean;
}

interface RunMigrationsOptions {
  logger: Logger;
  client: Client;
  migrationsDir: string;
}

export const runMigrations = async ({
  logger,
  client,
  migrationsDir,
}: RunMigrationsOptions): Promise<void> => {
  await client.query("SELECT pg_advisory_lock(hashtextextended($1, 0))", [LOCK_NAME]);

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        filename TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    const result = await client.query<MigrationRow>("SELECT filename, checksum FROM migrations");
    const executedMigrations = new Map(result.rows.map((row) => [row.filename, row.checksum]));

    const files = readdirSync(migrationsDir)
      .filter((filename) => filename.endsWith(".sql"))
      .sort();

    for (const filename of files) {
      const sql = readFileSync(path.join(migrationsDir, filename), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const executedChecksum = executedMigrations.get(filename);

      if (executedChecksum !== undefined) {
        if (executedChecksum !== checksum) {
          throw new Error(
            `Migration checksum mismatch: ${filename} (stored ${executedChecksum}, current ${checksum})`,
          );
        }

        logger.info(`Skipping migration: ${filename}`);
        continue;
      }

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO migrations (filename, checksum) VALUES ($1, $2)", [
          filename,
          checksum,
        ]);
        await client.query("COMMIT");
        logger.info(`Completed migration: ${filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        logger.error(`Migration failed: ${filename}`, error);
        throw error;
      }
    }

    logger.info("All migrations completed.");
  } finally {
    const result = await client.query<LockReleaseRow>(
      "SELECT pg_advisory_unlock(hashtextextended($1, 0)) AS unlocked",
      [LOCK_NAME],
    );
    if (!result.rows[0]?.unlocked) {
      logger.error("Failed to release migrations advisory lock.");
    }
  }
};
