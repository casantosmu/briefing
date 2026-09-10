import { z } from "zod";

import { ARTICLE_INTERESTS } from "../core/article-interest.js";

const MAX_PAGE_SIZE = 100;

const pageSchema = z.coerce
  .number()
  .int("Page must be a positive integer")
  .min(1, "Page must be a positive integer")
  .max(Number.MAX_SAFE_INTEGER, "Page is too large");

const limitSchema = z.coerce
  .number()
  .int("Limit must be a positive integer")
  .min(1, "Limit must be a positive integer")
  .max(MAX_PAGE_SIZE, `Limit must be at most ${MAX_PAGE_SIZE}`);

export const feedQuerySchema = z.object({
  page: pageSchema.default(1),
  limit: limitSchema.default(25),
});

export const articleParamsSchema = z.object({
  articleId: z.uuid("Article ID must be a valid UUID"),
});

export const articleInterestBodySchema = z.object({
  interest: z.enum(ARTICLE_INTERESTS),
});
