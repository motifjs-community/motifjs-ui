import type { SchedulerDay } from './scheduler-day';
import type { StripPiece } from './strip-piece';

/** A row of days with bars over it: the all-day panel, or a week of the month view. */
export interface StripRow<T> {
  index: number;
  days: SchedulerDay[];
  pieces: StripPiece<T>[];
  /** Per day: the appointments left out. */
  more: number[];
  /** Per day: the line "+N more" goes on. */
  moreAt: number[];
  /** How many lines the bars take. */
  lanes: number;
}
