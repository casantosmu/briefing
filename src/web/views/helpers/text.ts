import { htmlToText as htmlToTextLib } from "html-to-text";

import { estimateReadingSeconds } from "../../../core/article.js";

export const truncateText = (text: string, maxLength = 300) => {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

export const formatReadingTime = (wordCount: number): string => {
  const minutes = Math.max(1, Math.ceil(estimateReadingSeconds(wordCount) / 60));
  return `${minutes} min read`;
};

export const htmlToText = (value: string) => {
  return htmlToTextLib(value, {
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  });
};
