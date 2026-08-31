import { createApp } from "./app";
import { loadConfig } from "./config";
import { createPinoLogger } from "./logger.pino";
import { createRouter } from "./router";
import { createServer } from "./server";

const config = loadConfig();

const { port, logLevel } = config;

const logger = createPinoLogger({ level: logLevel });
const router = createRouter();
const app = createApp({ router });
const server = createServer({ app, port });

try {
  await server.start();
  logger.info(`Server started on port ${port}`);
} catch (error) {
  logger.error("Server start error", error);
  process.exit(1);
}
