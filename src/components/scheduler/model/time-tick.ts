import type { SchedulerDay } from './scheduler-day';

/** A cell along a timeline's time: a time row of a day, or a whole day (`slot` -1). The same object stays at its place while the dates change. */
export interface TimeTick {
  /** Its place along the time, from 0. */
  index: number;
  day: SchedulerDay;
  /** The time row of the day (`-1`: the whole day). */
  slot: number;
  /** Minutes after the day's start on the clock. */
  minutes: number;
  /** The first cell of an hour, and of a day of hours (a whole day's cell is not one). */
  hourStart: boolean;
  dayStart: boolean;
}
