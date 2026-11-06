/** A time range on the scheduler's grid: one cell, or several cells selected together. */
export interface SchedulerCell {
  start: Date;
  end: Date;
  /** Indicates a cell of the all-day panel, or a day of the month view. */
  allDay: boolean;
  /** Within a group, its resource values by field (`{ roomId: 1 }`). A new appointment there receives them. */
  resources?: Record<string, unknown> | null;
}
