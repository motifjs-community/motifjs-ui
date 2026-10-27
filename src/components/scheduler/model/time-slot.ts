/** A row of the day columns: a cell's time of day. */
export interface TimeSlot {
  index: number;
  /** Minutes after midnight. */
  minutes: number;
  /** The first cell of an hour (it carries the hour's label). */
  hourStart: boolean;
}
