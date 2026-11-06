import type { Pagination } from './Pagination';

export interface PageChangedEventArgs {
  /** The current page, starting from 1. */
  page: number;
  /** The current number of items per page. 0 shows all items on one page. */
  pageSize: number;
  /** `true` when the user changed the page, and `false` when it changed programmatically. */
  byUser: boolean;
  source: Pagination;
}
