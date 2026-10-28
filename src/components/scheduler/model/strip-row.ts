import type { SchedulerColumn } from './scheduler-column';
import type { SchedulerDay } from './scheduler-day';
import type { StripPiece } from './strip-piece';

/** A row of days with bars over it: the all-day panel, or a week of the month view. */
export interface StripRow<T> {
  index: number;
  days: SchedulerDay[];
  /** Its columns: a day, in a group. */
  columns: SchedulerColumn[];
  pieces: StripPiece<T>[];
  /** Per column: the appointments left out. */
  more: number[];
  /** Per column: the line "+N more" goes on. */
  moreAt: number[];
  /** How many lines the bars take. */
  lanes: number;
}
