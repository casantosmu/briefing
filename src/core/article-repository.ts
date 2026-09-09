import type { Article } from "./article.js";
import type { Category } from "./category.js";
import type { Tag } from "./tag.js";

export type CreateArticleInput = Pick<
  Article,
  | "sourceId"
  | "externalId"
  | "title"
  | "contentHtml"
  | "canonicalUrl"
  | "language"
  | "wordCount"
  | "publishedAt"
  | "sourceUpdatedAt"
  | "rawPayload"
> & {
  categories: Pick<Category, "name">[];
  tags: Pick<Tag, "name">[];
};

export interface ArticleRepository {
  createMany(articles: CreateArticleInput[]): Promise<void>;
}
