import type { Pagination } from './Pagination';

export interface PageChangedEventArgs {
  /** The page now, from 1. */
  page: number;
  /** Items per page now; 0: all on one page. */
  pageSize: number;
  /** `true` when the user moved, `false` when code did. */
  byUser: boolean;
  source: Pagination;
}
