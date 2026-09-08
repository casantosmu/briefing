import type { FeedArticle } from "./feed-article.js";
import type { PaginationQuery } from "./pagination.js";

export interface FeedArticlesResult {
  articles: FeedArticle[];
  count: number;
}

export interface FeedRepository {
  findMany(userId: string, query: PaginationQuery): Promise<FeedArticlesResult>;
}
