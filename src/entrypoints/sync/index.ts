import { htmlToText } from "html-to-text";
import { Pool } from "pg";

import { createWordPressClient } from "../../clients/wordpress.client.js";
import { countWords } from "../../core/article.js";
import { createArticlePostgres } from "../../db/article.postgres.js";
import { createSourcePostgres } from "../../db/source.postgres.js";
import { createPinoLogger } from "../../logger.pino.js";
import { loadConfig } from "./config.js";

const SYNC_PAGE_SIZE = 100;
const INITIAL_SYNC_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

const config = loadConfig();

const logger = createPinoLogger();

const pool = new Pool({ connectionString: config.postgresUrl });
const articleRepository = createArticlePostgres({ pool });
const sourceRepository = createSourcePostgres({ pool });

const sync = async () => {
  const source = await sourceRepository.findById(config.sourceId);
  if (!source) {
    throw new Error(`Source ${config.sourceId} not found`);
  }

  const to = new Date();
  const from = source.lastSyncedAt ?? new Date(to.getTime() - INITIAL_SYNC_LOOKBACK_MS);
  const sourceClient = createWordPressClient(source);

  logger.info("Source sync started", {
    sourceId: source.id,
    from,
    to,
    pageSize: SYNC_PAGE_SIZE,
  });

  let cursor: string | null = null;
  let pageCount = 0;
  let articleCount = 0;

  do {
    const result = await sourceClient.fetchArticles({
      from,
      to,
      cursor,
      limit: SYNC_PAGE_SIZE,
    });

    await articleRepository.createMany(
      result.articles.map((article) => ({
        sourceId: source.id,
        externalId: article.externalId,
        title: htmlToText(article.title),
        contentHtml: article.contentHtml,
        canonicalUrl: article.canonicalUrl,
        language: article.language,
        wordCount: countWords(htmlToText(article.contentHtml)),
        publishedAt: article.publishedAt,
        sourceUpdatedAt: article.sourceUpdatedAt,
        rawPayload: article.rawPayload,
        categories: article.categories.map((category) => ({ name: category.name })),
        tags: article.tags.map((tag) => ({ name: tag.name })),
      })),
    );

    pageCount += 1;
    articleCount += result.articles.length;
    cursor = result.nextCursor;
  } while (cursor !== null);

  await sourceRepository.updateById(source.id, {
    lastSyncedAt: to,
  });

  logger.info("Source sync completed", {
    sourceId: source.id,
    pageCount,
    articleCount,
    syncedAt: to,
  });
};

try {
  await sync();
} catch (error) {
  logger.error("Source sync failed", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
