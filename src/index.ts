import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createPinoLogger } from "./logger.pino.js";
import { createRouter } from "./router.js";
import { createServer } from "./server.js";

const config = loadConfig();

const { port, logLevel } = config;

const logger = createPinoLogger({ level: logLevel });
const router = createRouter();
const app = createApp({ router, logger });
const server = createServer({ app, port });

try {
  await server.start();
  logger.info(`Server started on port ${port}`);
} catch (error) {
  logger.error("Server start error", error);
  process.exit(1);
}
