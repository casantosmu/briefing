import type { Logger } from "./core/logger.js";

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      requestId: string;
    }
  }
}

export {};
