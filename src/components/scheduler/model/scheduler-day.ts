/** A day the view shows. The same object stays at its place while the dates change. */
export interface SchedulerDay {
  /** Its place in the view, from 0. */
  index: number;
  /** The day's start, on the scheduler's clock. */
  date: Date;
  /** The day as a date of the browser's clock (what `isHoliday` and the calendar get). */
  local: Date;
  /** The day's start as a wall clock time (milliseconds of UTC with its fields): the layout counts on it. */
  wall: number;
  today: boolean;
  /** A day before today. */
  past: boolean;
  /** A day of the work week. */
  work: boolean;
  /** Saturday or Sunday (by the locale's week). */
  weekend: boolean;
  holiday: boolean;
  /** Month view: a day of the month before or after. */
  outside: boolean;
}
