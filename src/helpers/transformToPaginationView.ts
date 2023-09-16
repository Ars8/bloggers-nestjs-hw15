export type PaginationViewType<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<T>;
};

export const transformToPaginationView = <T>(
  totalCount: number,
  pageSize: number,
  pageNumber: number,
  items: Array<T>,
): PaginationViewType<T> => ({
  pagesCount: Math.ceil(totalCount / pageSize),
  page: pageNumber,
  pageSize: pageSize,
  totalCount: totalCount,
  items,
});
