import type { SchedulerViewType } from './scheduler-view-type';

/** The context of a cell template: the cell's time, which changes in place with the displayed date. */
export interface CellTemplateContext {
  readonly start: Date;
  readonly end: Date;
  /** Indicates a whole-day cell (the all-day panel, the month, the timeline month). */
  readonly allDay: boolean;
  /** The resource values of its group, by field. `null` without groups. */
  readonly resources: Record<string, unknown> | null;
  readonly view: SchedulerViewType;
  readonly today: boolean;
  /** Indicates that the cell is within the work hours of its group. */
  readonly work: boolean;
  /** Indicates that the cell is within a blocked time. */
  readonly blocked: boolean;
}
