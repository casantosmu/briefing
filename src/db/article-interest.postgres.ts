import type { Pool } from "pg";

import type { ArticleInterest } from "../core/article-interest.js";
import type { ArticleInterestRepository } from "../core/article-interest-repository.js";

interface ArticleInterestRow {
  interest: ArticleInterest;
}

interface ArticleInterestPostgresDependencies {
  pool: Pool;
}

export const createArticleInterestPostgres = ({
  pool,
}: ArticleInterestPostgresDependencies): ArticleInterestRepository => ({
  async toggle(userId, articleId, interest) {
    const result = await pool.query<ArticleInterestRow>(
      `
        WITH removed_interest AS (
          DELETE FROM user_article_interest
          WHERE app_user_id = $1
            AND article_id = $2
            AND interest = $3
          RETURNING app_user_id, article_id
        )
        INSERT INTO user_article_interest (app_user_id, article_id, interest)
        SELECT $1, $2, $3
        WHERE NOT EXISTS (SELECT 1 FROM removed_interest)
        ON CONFLICT (app_user_id, article_id)
        DO UPDATE SET
          interest = EXCLUDED.interest,
          updated_at = NOW()
        RETURNING interest
      `,
      [userId, articleId, interest],
    );

    return result.rows[0]?.interest ?? null;
  },
});
