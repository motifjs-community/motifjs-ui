/** A time on the scheduler's grid: a cell, or several cells selected together. */
export interface SchedulerCell {
  start: Date;
  end: Date;
  /** A cell of the all-day panel, or a day of the month view. */
  allDay: boolean;
  /** In a group: its resource values, by field (`{ roomId: 1 }`); a new appointment there gets them. */
  resources?: Record<string, unknown> | null;
}
