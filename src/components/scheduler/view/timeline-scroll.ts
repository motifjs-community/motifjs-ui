/** What the timeline view does for its scheduler: scrolls to a cell along the time and to a row. */
export interface TimelineScroll {
  /** Puts the cell (its start) and the row at the start of the view; `null` leaves that way as it is. */
  scrollTo(tick: number | null, row: number | null): void;
  /** Scrolls only as far as needed for the cell and the row to be in view, and builds them. */
  reveal(tick: number | null, row: number | null): void;
}
