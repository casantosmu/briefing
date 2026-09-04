import path from "node:path";

import express, { type Express, type Router } from "express";

import type { Logger } from "./logger.js";
import { createLogMiddleware } from "./middlewares/log.middleware.js";

const assetsPath = path.join(process.cwd(), "public/assets");
const cssPath = path.join(process.cwd(), "node_modules/bootstrap/dist/css");

interface AppDependencies {
  router: Router;
  logger: Logger;
}

export const createApp = ({ router, logger }: AppDependencies): Express => {
  const app = express();

  app.use(createLogMiddleware({ logger }));

  app.use("/assets", express.static(assetsPath));
  app.use("/bootstrap/css", express.static(cssPath));

  app.use(router);

  return app;
};
