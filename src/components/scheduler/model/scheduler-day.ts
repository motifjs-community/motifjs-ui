/** A day the view shows. The same object stays at its place while the dates change. */
export interface SchedulerDay {
  /** Its place in the view, from 0. */
  index: number;
  /** The day's start. */
  date: Date;
  today: boolean;
  /** A day of the work week. */
  work: boolean;
  /** Saturday or Sunday (by the locale's week). */
  weekend: boolean;
  holiday: boolean;
  /** Month view: a day of the month before or after. */
  outside: boolean;
}
