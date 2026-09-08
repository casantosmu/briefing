const WORDS_PER_MINUTE = 200;

export const estimateReadingSeconds = (wordCount: number): number => {
  return Math.ceil((wordCount / WORDS_PER_MINUTE) * 60);
};
