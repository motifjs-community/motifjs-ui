import type { SchedulerViewType } from './scheduler-view-type';

/** What a cell template gets: the cell's time (it changes in place with the date shown). */
export interface CellTemplateContext {
  readonly start: Date;
  readonly end: Date;
  /** A cell of a whole day (the all-day panel, the month, the timeline month). */
  readonly allDay: boolean;
  /** Its group's resource values, by field; `null` without groups. */
  readonly resources: Record<string, unknown> | null;
  readonly view: SchedulerViewType;
  readonly today: boolean;
  /** In the work hours of its group. */
  readonly work: boolean;
  /** In a blocked time. */
  readonly blocked: boolean;
}
