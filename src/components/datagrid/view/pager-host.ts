/** What the pager asks the grid: moves that leave an edited row first, the grid's name and its rows. */
export interface PagerHost {
  /** Goes to a page, 0-based. */
  goTo(page: number): void;
  /** Rows per page; 0: every row on one page. */
  setPageSize(size: number): void;
  /** The grid's accessible name. */
  gridLabel(): string;
  /** Data rows, saved new rows included. */
  total(): number;
}
