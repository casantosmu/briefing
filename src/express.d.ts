import type { Logger } from "./logger.js";

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      requestId: string;
    }
  }
}

export {};
