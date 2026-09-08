export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface Pagination {
  previous?: number;
  next?: number;
}

export const createPagination = (
  count: number,
  { page, limit }: PaginationQuery,
): Pagination | undefined => {
  const totalPages = Math.ceil(count / limit);

  const previous = page > 1 ? page - 1 : undefined;
  const next = page < totalPages ? page + 1 : undefined;

  if (previous === undefined && next === undefined) {
    return undefined;
  }

  return { previous, next };
};
