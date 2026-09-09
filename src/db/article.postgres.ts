import type { Pool } from "pg";

import type { ArticleIdentity } from "../core/article.js";
import type { ArticleRepository } from "../core/article-repository.js";

interface ArticleIdentityRow {
  article_id: string;
  source_id: string;
  external_id: string;
}

interface ArticlePostgresDependencies {
  pool: Pool;
}

export const createArticlePostgres = ({
  pool,
}: ArticlePostgresDependencies): ArticleRepository => ({
  async createMany(articles) {
    const uniqueArticles = [
      ...new Map(articles.map((article) => [getArticleIdentityKey(article), article])).values(),
    ];
    if (uniqueArticles.length === 0) {
      return;
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query<ArticleIdentityRow>(
        `
          INSERT INTO article (
            source_id,
            external_id,
            title,
            content_html,
            canonical_url,
            language,
            word_count,
            published_at,
            source_updated_at,
            raw_payload
          )
          SELECT
            source_id,
            external_id,
            title,
            content_html,
            canonical_url,
            language,
            word_count,
            published_at,
            source_updated_at,
            raw_payload
          FROM unnest(
            $1::uuid[],
            $2::text[],
            $3::text[],
            $4::text[],
            $5::text[],
            $6::text[],
            $7::integer[],
            $8::timestamptz[],
            $9::timestamptz[],
            $10::text[]
          ) AS articles(
            source_id,
            external_id,
            title,
            content_html,
            canonical_url,
            language,
            word_count,
            published_at,
            source_updated_at,
            raw_payload
          )
          ON CONFLICT (source_id, external_id)
          DO UPDATE SET
            title = EXCLUDED.title,
            content_html = EXCLUDED.content_html,
            canonical_url = EXCLUDED.canonical_url,
            language = EXCLUDED.language,
            word_count = EXCLUDED.word_count,
            published_at = EXCLUDED.published_at,
            source_updated_at = EXCLUDED.source_updated_at,
            raw_payload = EXCLUDED.raw_payload,
            updated_at = NOW()
          RETURNING article_id, source_id, external_id
        `,
        [
          uniqueArticles.map((article) => article.sourceId),
          uniqueArticles.map((article) => article.externalId),
          uniqueArticles.map((article) => article.title),
          uniqueArticles.map((article) => article.contentHtml),
          uniqueArticles.map((article) => article.canonicalUrl),
          uniqueArticles.map((article) => article.language),
          uniqueArticles.map((article) => article.wordCount),
          uniqueArticles.map((article) => article.publishedAt),
          uniqueArticles.map((article) => article.sourceUpdatedAt),
          uniqueArticles.map((article) => article.rawPayload),
        ],
      );

      const articleIdsByIdentity = new Map(
        result.rows.map((article) => [
          getArticleIdentityKey({
            sourceId: article.source_id,
            externalId: article.external_id,
          }),
          article.article_id,
        ]),
      );
      const articleIds = result.rows.map((article) => article.article_id);
      const categoryNames = [
        ...new Set(
          uniqueArticles.flatMap((article) => article.categories.map((category) => category.name)),
        ),
      ];
      const tagNames = [
        ...new Set(uniqueArticles.flatMap((article) => article.tags.map((tag) => tag.name))),
      ];

      await client.query(
        `
          INSERT INTO category (name)
          SELECT name
          FROM unnest($1::text[]) AS categories(name)
          ON CONFLICT (name) DO NOTHING
        `,
        [categoryNames],
      );

      await client.query(
        `
          INSERT INTO tag (name)
          SELECT name
          FROM unnest($1::text[]) AS tags(name)
          ON CONFLICT (name) DO NOTHING
        `,
        [tagNames],
      );

      await client.query("DELETE FROM article_category WHERE article_id = ANY($1::uuid[])", [
        articleIds,
      ]);
      await client.query("DELETE FROM article_tag WHERE article_id = ANY($1::uuid[])", [
        articleIds,
      ]);

      const articleCategoryIds: string[] = [];
      const articleCategoryNames: string[] = [];
      const articleTagIds: string[] = [];
      const articleTagNames: string[] = [];

      for (const article of uniqueArticles) {
        const articleId = articleIdsByIdentity.get(getArticleIdentityKey(article));
        if (articleId === undefined) {
          throw new Error(`Article was not persisted: ${article.externalId}`);
        }

        for (const category of new Map(article.categories.map((c) => [c.name, c])).values()) {
          articleCategoryIds.push(articleId);
          articleCategoryNames.push(category.name);
        }

        for (const tag of new Map(article.tags.map((t) => [t.name, t])).values()) {
          articleTagIds.push(articleId);
          articleTagNames.push(tag.name);
        }
      }

      await client.query(
        `
          INSERT INTO article_category (article_id, category_id)
          SELECT article_categories.article_id, category.category_id
          FROM unnest($1::uuid[], $2::text[])
            AS article_categories(article_id, category_name)
          JOIN category ON category.name = article_categories.category_name
        `,
        [articleCategoryIds, articleCategoryNames],
      );

      await client.query(
        `
          INSERT INTO article_tag (article_id, tag_id)
          SELECT article_tags.article_id, tag.tag_id
          FROM unnest($1::uuid[], $2::text[])
            AS article_tags(article_id, tag_name)
          JOIN tag ON tag.name = article_tags.tag_name
        `,
        [articleTagIds, articleTagNames],
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
});

const getArticleIdentityKey = ({ sourceId, externalId }: ArticleIdentity): string => {
  return JSON.stringify([sourceId, externalId]);
};
