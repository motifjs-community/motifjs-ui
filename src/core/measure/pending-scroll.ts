/** A scroll written through a component and not made yet: where each axis goes, and how far it moves on from there. */
export interface PendingScroll {
  start?: number;
  top?: number;
  byStart: number;
  byTop: number;
  /** Counts the writes: only the last one's turn forgets it. */
  writes: number;
}
