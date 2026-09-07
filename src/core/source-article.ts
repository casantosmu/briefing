export interface SourceArticleCategory {
  externalId: string;
  name: string;
}

export interface SourceArticleTag {
  externalId: string;
  name: string;
}

export interface SourceArticle {
  externalId: string;
  title: string;
  contentHtml: string;
  canonicalUrl: string;
  language: string | null;
  publishedAt: Date;
  sourceUpdatedAt: Date;
  categories: SourceArticleCategory[];
  tags: SourceArticleTag[];
  rawPayload: string;
}
