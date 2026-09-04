import path from "node:path";

import express, { type Express, type Router } from "express";

import type { Logger } from "./logger.js";
import { createLogMiddleware } from "./middlewares/log.middleware.js";

interface AppDependencies {
  router: Router;
  logger: Logger;
}

export const createApp = ({ router, logger }: AppDependencies): Express => {
  const app = express();
  app.use(createLogMiddleware({ logger }));
  app.use("/assets", express.static(path.join(process.cwd(), "public/assets")));
  app.use(router);
  return app;
};
