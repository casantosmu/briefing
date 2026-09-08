import type { Pool } from "pg";

import type { ArticleInterest } from "../core/article-interest.js";
import type { FeedArticle } from "../core/feed-article.js";
import type { FeedRepository } from "../core/feed-repository.js";
import { toDate } from "./helpers.js";

interface FeedArticleRow {
  article_id: string;
  title: string;
  content_html: string;
  canonical_url: string;
  word_count: number;
  published_at: Date | string;
  categories: CategoryRow[];
  tags: TagRow[];
  user_article_interest: ArticleInterest | null;
}

interface ArticleCountRow {
  count: string;
}

interface CategoryRow {
  id: string;
  name: string;
  createdAt: Date | string;
}

interface TagRow {
  id: string;
  name: string;
  createdAt: Date | string;
}

interface FeedPostgresDependencies {
  pool: Pool;
}

const FEED_ARTICLE_SELECT = `
  SELECT
    article.article_id,
    article.title,
    article.content_html,
    article.canonical_url,
    article.word_count,
    article.published_at,
    user_article_interest.interest AS user_article_interest,
    COALESCE((
      SELECT json_agg(json_build_object(
        'id', category.category_id,
        'name', category.name,
        'createdAt', category.created_at
      ) ORDER BY category.name)
      FROM article_category
      JOIN category ON category.category_id = article_category.category_id
      WHERE article_category.article_id = article.article_id
    ), '[]'::json) AS categories,
    COALESCE((
      SELECT json_agg(json_build_object(
        'id', tag.tag_id,
        'name', tag.name,
        'createdAt', tag.created_at
      ) ORDER BY tag.name)
      FROM article_tag
      JOIN tag ON tag.tag_id = article_tag.tag_id
      WHERE article_tag.article_id = article.article_id
    ), '[]'::json) AS tags
  FROM article
  LEFT JOIN user_article_interest
    ON user_article_interest.article_id = article.article_id
    AND user_article_interest.app_user_id = $1
`;

export const createFeedPostgres = ({ pool }: FeedPostgresDependencies): FeedRepository => ({
  async findMany(userId, { page, limit }) {
    const offset = (page - 1) * limit;

    const sql = `${FEED_ARTICLE_SELECT}
      ORDER BY article.published_at DESC, article.article_id DESC
      LIMIT $2
      OFFSET $3
    `;

    const [articlesResult, countResult] = await Promise.all([
      pool.query<FeedArticleRow>(sql, [userId, limit, offset]),
      pool.query<ArticleCountRow>("SELECT COUNT(*)::text AS count FROM article"),
    ]);

    return {
      articles: articlesResult.rows.map(mapToFeedArticle),
      count: Number(countResult.rows[0]?.count ?? 0),
    };
  },
});

const mapToFeedArticle = (row: FeedArticleRow): FeedArticle => ({
  id: row.article_id,
  title: row.title,
  contentHtml: row.content_html,
  canonicalUrl: row.canonical_url,
  wordCount: row.word_count,
  publishedAt: toDate(row.published_at),
  categories: row.categories.map((category) => ({
    id: category.id,
    name: category.name,
    createdAt: toDate(category.createdAt),
  })),
  tags: row.tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    createdAt: toDate(tag.createdAt),
  })),
  userInterest: row.user_article_interest,
});
