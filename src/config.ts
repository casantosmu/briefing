import { isLogLevel, LOG_LEVELS, type LogLevel } from "./logger.js";

export interface Config {
  logLevel: LogLevel;
  postgresUrl: string;
  port: number;
}

export const loadConfig = (): Config => {
  const logLevel = process.env.LOG_LEVEL ?? "info";
  const postgresUrl = process.env.DATABASE_URL;
  const port = Number(process.env.PORT ?? 3000);

  if (!postgresUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!isLogLevel(logLevel)) {
    throw new Error(`LOG_LEVEL must be one of: ${LOG_LEVELS.join(", ")}`);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return { logLevel, postgresUrl, port };
};
