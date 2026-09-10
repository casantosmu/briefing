import type { ArticleInterest } from "../../../core/article-interest.js";

interface ArticleInterestFormProps {
  articleId: string;
  interest: ArticleInterest | null;
}

export const ArticleInterestForm = ({ articleId, interest }: ArticleInterestFormProps) => {
  return (
    <form
      x-server-action="true"
      id={`article-interest-${articleId}`}
      className="m-0 d-flex flex-wrap gap-2"
      method="post"
      action={`/articles/${articleId}/interest`}
    >
      <button
        type="submit"
        name="interest"
        value="interested"
        className={`btn btn-sm opacity-100 ${interest === "interested" ? "btn-primary" : "btn-outline-secondary"}`}
        aria-pressed={interest === "interested"}
      >
        <span aria-hidden="true">👍</span> {"Yes"}
      </button>

      <button
        type="submit"
        name="interest"
        value="not_interested"
        className={`btn btn-sm opacity-100 ${interest === "not_interested" ? "btn-danger" : "btn-outline-secondary"}`}
        aria-pressed={interest === "not_interested"}
      >
        <span aria-hidden="true">👎</span> {"No"}
      </button>
    </form>
  );
};
