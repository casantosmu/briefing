import type { Source } from "../core/source.js";
import type { SourceArticle } from "../core/source-article.js";
import type { SourceClient } from "../core/source-client.js";
import { createHttpClient } from "./http-client.js";

interface WordPressRenderedText {
  rendered: string;
}

interface WordPressTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: "category" | "post_tag";
}

interface WordPressPost {
  id: number;
  title: WordPressRenderedText;
  excerpt: WordPressRenderedText;
  content: WordPressRenderedText;
  status: "publish" | "future" | "draft" | "pending" | "private";
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  link: string;
  tags: number[];
  categories: number[];
  _embedded?: {
    "wp:term"?: WordPressTerm[][];
  };
}

export const createWordPressClient = (source: Source): SourceClient => {
  const httpClient = createHttpClient(source.baseUrl);

  return {
    async fetchArticles(query) {
      const page = query.cursor ? Number(query.cursor) : 1;

      const response = await httpClient.get<WordPressPost[]>("/wp-json/wp/v2/posts", {
        params: {
          after: query.from,
          before: query.to,
          page,
          per_page: query.limit ?? 100,
          order: "desc",
          orderby: "date",
          // Embed terms so category and tag names are available without extra requests.
          _embed: "wp:term",
        },
      });

      const totalPages = Number(response.headers.get("x-wp-totalpages"));

      return {
        articles: response.data.map(mapToSourceArticle),
        nextCursor: page < totalPages ? String(page + 1) : null,
      };
    },
  };
};

const mapToSourceArticle = (post: WordPressPost): SourceArticle => {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];

  return {
    externalId: String(post.id),
    title: post.title.rendered.trim(),
    contentHtml: post.content.rendered.trim(),
    canonicalUrl: post.link,
    language: null,
    publishedAt: new Date(`${post.date_gmt}Z`),
    sourceUpdatedAt: new Date(`${post.modified_gmt}Z`),
    categories: terms
      .filter((term) => term.taxonomy === "category")
      .map((term) => ({
        externalId: String(term.id),
        name: term.name,
      })),
    tags: terms
      .filter((term) => term.taxonomy === "post_tag")
      .map((term) => ({
        externalId: String(term.id),
        name: term.name,
      })),
    rawPayload: JSON.stringify(post),
  };
};
