/** The part of a blocked time in a column's day: minutes after the day's start on the clock. */
export interface DayBlock {
  from: number;
  to: number;
  text: string;
}
