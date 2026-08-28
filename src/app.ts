import express, { type Express, type Router } from "express";

interface AppDependencies {
  router: Router;
}

export const createApp = ({ router }: AppDependencies): Express => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};
