import path from "node:path";

import { Client } from "pg";

import { runMigrations } from "../../db/migrations.js";
import { createPinoLogger } from "../../logger.pino.js";
import { loadConfig } from "./config.js";

const config = loadConfig();

const logger = createPinoLogger();

const client = new Client({ connectionString: config.postgresUrl });
await client.connect();

try {
  await runMigrations({
    logger,
    client,
    migrationsDir: path.join(process.cwd(), "migrations"),
  });
} finally {
  await client.end();
}
