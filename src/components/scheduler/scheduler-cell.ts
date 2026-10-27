/** A time on the scheduler's grid: a cell, or several cells selected together. */
export interface SchedulerCell {
  start: Date;
  end: Date;
  /** A cell of the all-day panel, or a day of the month view. */
  allDay: boolean;
}
