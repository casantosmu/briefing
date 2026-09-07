import { Pool } from "pg";

import { createPinoLogger } from "../../logger.pino.js";
import { createApp } from "../../web/app.js";
import { createRouter } from "../../web/router.js";
import { createServer } from "../../web/server.js";
import { loadConfig } from "./config.js";

const config = loadConfig();

const logger = createPinoLogger({ level: config.logLevel });

const pool = new Pool({ connectionString: config.postgresUrl });

const router = createRouter();
const app = createApp({ logger, router });
const server = createServer({ app, port: config.port });

const start = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection OK");
  } catch (error) {
    logger.error("Database connection error", error);
    await pool.end();
    process.exit(1);
  }

  try {
    await server.start();
    logger.info(`Server started on port ${config.port}`);
  } catch (error) {
    logger.error("Server start error", error);
    await pool.end();
    process.exit(1);
  }
};

await start();
