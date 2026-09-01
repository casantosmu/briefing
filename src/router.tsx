import { type Response,Router } from "express";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MainLayout } from "./views/layouts/MainLayout.js";
import { HomePage } from "./views/pages/HomePage.js";

export const createRouter = (): Router => {
  const router = Router();

  router.get("/", (req, res) => {
    sendPage(
      res,
      <MainLayout>
        <HomePage />
      </MainLayout>,
    );
  });

  return router;
};

const sendPage = (res: Response, node: ReactNode) => {
  res.type("html").send(`<!doctype html>${renderToStaticMarkup(node)}`);
};
