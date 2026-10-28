import type { SchedulerViewType } from '../scheduler-view-type';

/** The view on screen with every setting decided (its own value, else the scheduler's). */
export interface ResolvedView {
  name: string;
  type: SchedulerViewType;
  intervalCount: number;
  startDayHour: number;
  endDayHour: number;
  cellDuration: number;
  allDayPanel: boolean;
  maxAppointmentsPerCell: number | 'auto';
  /** The resource fields the columns are grouped by, outer first (the ones of a resource kind). */
  groups: string[];
  /** The groups stand under each date, not the dates under each group. */
  groupByDate: boolean;
}
