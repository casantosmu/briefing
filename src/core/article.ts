import type { Category } from "./category.js";
import type { Tag } from "./tag.js";

const WORDS_PER_MINUTE = 200;

export interface Article {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  contentHtml: string;
  canonicalUrl: string;
  language: string | null;
  wordCount: number;
  publishedAt: Date;
  sourceUpdatedAt: Date;
  rawPayload: string;
  categories: Category[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export type ArticleIdentity = Pick<Article, "sourceId" | "externalId">;

export const countWords = (text: string): number => {
  const normalizedText = text.trim();
  return normalizedText === "" ? 0 : normalizedText.split(/\s+/u).length;
};

export const estimateReadingSeconds = (wordCount: number): number => {
  return Math.ceil((wordCount / WORDS_PER_MINUTE) * 60);
};
