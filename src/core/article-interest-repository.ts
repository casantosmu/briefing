import type { ArticleInterest } from "./article-interest.js";

export interface ArticleInterestRepository {
  toggle(
    userId: string,
    articleId: string,
    interest: ArticleInterest,
  ): Promise<ArticleInterest | null>;
}
