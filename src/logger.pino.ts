import pino, { type Logger as PinoLogger } from "pino";

import type { Logger, LogLevel } from "./logger.js";

interface CreatePinoLoggerOptions {
  level?: LogLevel;
}

export const createPinoLogger = ({ level = "info" }: CreatePinoLoggerOptions = {}): Logger => {
  return createLoggerFromPino(
    pino({
      level,
      messageKey: "message",
      errorKey: "error",
      formatters: {
        level: (label) => ({ level: label }),
      },
    }),
  );
};

const createLoggerFromPino = (logger: PinoLogger): Logger => ({
  debug: (message, metadata) => {
    logger.debug(metadata ?? {}, message);
  },
  info: (message, metadata) => {
    logger.info(metadata ?? {}, message);
  },
  warn: (message, metadata) => {
    logger.warn(metadata ?? {}, message);
  },
  error: (message, metadata) => {
    logger.error(metadata ?? {}, message);
  },
  child: (bindings) => {
    return createLoggerFromPino(logger.child(bindings));
  },
});
