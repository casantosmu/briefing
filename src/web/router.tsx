import { type Response, Router } from "express";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { FeedRepository } from "../core/feed-repository.js";
import { createPagination } from "../core/pagination.js";
import { feedQuerySchema } from "./schemas.js";
import { MainLayout } from "./views/layout/MainLayout.js";
import { FeedPage } from "./views/pages/FeedPage.js";

interface RouterDependencies {
  userId: string;
  defaultLocale: string;
  defaultTimezone: string;
  feedRepository: FeedRepository;
}

export const createRouter = ({
  userId,
  defaultLocale,
  defaultTimezone,
  feedRepository,
}: RouterDependencies): Router => {
  const router = Router();

  router.get("/", (req, res) => {
    res.redirect("/feed");
  });

  router.get("/feed", async (req, res) => {
    const { page, limit } = feedQuerySchema.parse(req.query);

    const feedPage = await feedRepository.findMany(userId, { page, limit });
    const pagination = createPagination(feedPage.count, { page, limit });

    sendPage(
      res,
      <MainLayout title="Feed">
        <FeedPage
          feedArticles={feedPage.articles}
          pagination={pagination}
          locale={defaultLocale}
          timezone={defaultTimezone}
        />
      </MainLayout>,
    );
  });

  return router;
};

const sendPage = (res: Response, node: ReactNode) => {
  res.type("html").send(`<!doctype html>${renderToStaticMarkup(node)}`);
};
