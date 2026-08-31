import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";

import type { Logger } from "../logger.js";

interface LogMiddlewareDependencies {
  logger: Logger;
}

export const createLogMiddleware = ({ logger }: LogMiddlewareDependencies): RequestHandler => {
  return (req, res, next) => {
    const startedAt = performance.now();

    const requestId = req.get("x-request-id") ?? randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    req.logger = logger.child({ requestId });

    res.on("finish", () => {
      const durationMs = Math.round(performance.now() - startedAt);
      const requestMetadata = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
      };

      if (res.statusCode >= 500) {
        req.logger.error("HTTP request failed", requestMetadata);
      } else if ([408, 409, 429].includes(res.statusCode)) {
        req.logger.warn("HTTP request completed with client error", requestMetadata);
      } else {
        req.logger.info("HTTP request completed", requestMetadata);
      }
    });

    next();
  };
};
