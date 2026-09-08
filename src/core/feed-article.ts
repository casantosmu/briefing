import type { ArticleInterest } from "./article-interest.js";
import type { Category } from "./category.js";
import type { Tag } from "./tag.js";

export interface FeedArticle {
  id: string;
  title: string;
  contentHtml: string;
  canonicalUrl: string;
  wordCount: number;
  publishedAt: Date;
  categories: Category[];
  tags: Tag[];
  userInterest: ArticleInterest | null;
}
