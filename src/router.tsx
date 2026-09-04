import { type Response, Router } from "express";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MainLayout } from "./views/layouts/MainLayout.js";
import { HomePage } from "./views/pages/HomePage.js";

export const createRouter = (): Router => {
  const router = Router();

  let count = 0;

  router.get("/", (req, res) => {
    sendPage(
      res,
      <MainLayout>
        <HomePage count={count} />
      </MainLayout>,
    );
  });

  router.post("/counter", (_req, res) => {
    count += 1;

    sendAction(res, "counter", <HomePage count={count} />);
  });

  return router;
};

const sendPage = (res: Response, node: ReactNode) => {
  res.type("html").send(`<!doctype html>${renderToStaticMarkup(node)}`);
};

const sendAction = (res: Response, component: string, node: ReactNode) => {
  res.json({
    component,
    html: renderToStaticMarkup(node),
  });
};
