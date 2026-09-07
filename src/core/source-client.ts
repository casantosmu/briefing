import type { Source } from "./source.js";
import type { SourceArticle } from "./source-article.js";

export type SourceClientFactory = (source: Source) => SourceClient;

export interface FetchArticlesQuery {
  from?: Date | null;
  to?: Date | null;
  cursor?: string | null;
  limit?: number | null;
}

export interface FetchArticlesResult {
  articles: SourceArticle[];
  nextCursor: string | null;
}

export interface SourceClient {
  fetchArticles(query: FetchArticlesQuery): Promise<FetchArticlesResult>;
}
