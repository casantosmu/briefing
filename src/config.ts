import { isLogLevel, LOG_LEVELS, type LogLevel } from "./logger";

export interface Config {
  port: number;
  logLevel: LogLevel;
}

export const loadConfig = (): Config => {
  const port = Number(process.env.PORT ?? 3000);
  const logLevel = process.env.LOG_LEVEL ?? "info";

  if (!isLogLevel(logLevel)) {
    throw new Error(`LOG_LEVEL must be one of: ${LOG_LEVELS.join(", ")}`);
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return { port, logLevel };
};
