export const ARTICLE_INTERESTS = ["interested", "not_interested"] as const;

export type ArticleInterest = (typeof ARTICLE_INTERESTS)[number];
