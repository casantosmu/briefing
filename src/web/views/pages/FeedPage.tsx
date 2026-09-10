import type { FeedArticle } from "../../../core/feed-article.js";
import type { Pagination } from "../../../core/pagination.js";
import { formatReadingTime, htmlToText, truncateText } from "../helpers/text.js";
import { ArticleInterestForm } from "../partials/ArticleInterestForm.js";

interface FeedPageProps {
  feedArticles: FeedArticle[];
  pagination: Pagination | undefined;
  locale: string;
  timezone: string;
}

export const FeedPage = ({ feedArticles, pagination, locale, timezone }: FeedPageProps) => {
  if (!feedArticles.length) {
    return <p className="text-body-secondary">No articles available.</p>;
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  });

  return (
    <>
      <div className="d-flex flex-column gap-4">
        {feedArticles.map((feedArticle) => (
          <article key={feedArticle.id} className="border-bottom pb-3">
            <h2 className="h5 mb-1">
              <a
                href={feedArticle.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {feedArticle.title}
              </a>
            </h2>

            <div className="text-body-secondary small mb-2">
              <time dateTime={feedArticle.publishedAt.toISOString()}>
                {dateFormatter.format(feedArticle.publishedAt)}
              </time>{" "}
              · {formatReadingTime(feedArticle.wordCount)}
            </div>

            <p className="mb-2">{truncateText(htmlToText(feedArticle.contentHtml))}</p>

            {feedArticle.categories.length > 0 && (
              <div className="small">
                <span className="text-body-secondary">Categories:</span>{" "}
                <span>{feedArticle.categories.map((category) => category.name).join(", ")}</span>
              </div>
            )}

            {feedArticle.tags.length > 0 && (
              <div className="small mb-2">
                <span className="text-body-secondary">Tags:</span>{" "}
                <span>{feedArticle.tags.map((tag) => tag.name).join(", ")}</span>
              </div>
            )}

            <div className="mt-3">
              <div className="small fw-semibold mb-2">Interested in this story?</div>
              <ArticleInterestForm articleId={feedArticle.id} interest={feedArticle.userInterest} />
            </div>
          </article>
        ))}
      </div>

      {pagination && (
        <nav className="d-flex justify-content-between mt-4">
          {pagination.previous ? (
            <a href={`/feed?page=${pagination.previous}`} className="text-decoration-none">
              ← Previous
            </a>
          ) : (
            <span className="text-body-secondary">← Previous</span>
          )}

          {pagination.next ? (
            <a href={`/feed?page=${pagination.next}`} className="text-decoration-none">
              Next →
            </a>
          ) : (
            <span className="text-body-secondary">Next →</span>
          )}
        </nav>
      )}
    </>
  );
};
