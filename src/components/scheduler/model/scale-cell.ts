import type { SchedulerDay } from './scheduler-day';

/** A head over a timeline's cells: a month or a day (the upper tier), an hour or a day (the lower). */
export interface ScaleCell {
  key: string;
  /** The first cell it is over, and how many. */
  first: number;
  span: number;
  kind: 'month' | 'day' | 'hour';
  day: SchedulerDay;
  /** Minutes after the day's start (an hour's). */
  minutes: number;
  /** The first hour of its day. */
  dayStart: boolean;
}
