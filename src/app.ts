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
  app.use(express.json());
  app.use(express.static("public"));
  app.use(router);
  return app;
};
