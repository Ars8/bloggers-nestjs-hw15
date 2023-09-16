import { SortOrder } from 'mongoose';

export type QueryType = {
  searchLoginTerm: string;
  searchEmailTerm: string;
  searchNameTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortOrder;
};

export const queryHandler = (query: any): QueryType => {
  const resultQuery = {
    searchLoginTerm: query.searchLoginTerm || '',
    searchEmailTerm: query.searchEmailTerm || '',
    searchNameTerm: query.searchNameTerm || '',
    pageNumber: !isNaN(+query.pageNumber) ? +query.pageNumber : 1,
    pageSize: !isNaN(+query.pageSize) ? +query.pageSize : 10,
    sortBy: query.sortBy || 'createdAt',
    sortDirection:
      query.sortDirection === 'desc' || query.sortDirection === 'asc'
        ? query.sortDirection
        : 'desc',
  };
  return resultQuery;
};
