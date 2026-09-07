export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export const isLogLevel = (value: string): value is LogLevel =>
  LOG_LEVELS.includes(value as LogLevel);

export interface Logger {
  debug(message: string, metadata?: unknown): void;
  info(message: string, metadata?: unknown): void;
  warn(message: string, metadata?: unknown): void;
  error(message: string, metadata?: unknown): void;
  child(bindings: Record<string, unknown>): Logger;
}
