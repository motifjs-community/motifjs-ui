import type { SchedulerViewType } from '../scheduler-view-type';
import type { ScrollingMode } from './scrolling-mode';

/** The current view with every setting calculated: its own value, otherwise the scheduler's. */
export interface ResolvedView {
  name: string;
  type: SchedulerViewType;
  intervalCount: number;
  /** With an `intervalCount` greater than 1, the date intervals are counted from. `null` uses the displayed date. */
  startDate?: Date | null;
  startDayHour: number;
  endDayHour: number;
  cellDuration: number;
  allDayPanel: boolean;
  maxAppointmentsPerCell: number | 'auto';
  /** The resource fields the columns are grouped by, outer first. Only fields of a resource type are included. */
  groups: string[];
  /** Places the groups under each date, instead of the dates under each group. */
  groupByDate: boolean;
  /** The number of days the agenda shows. The default is 7. */
  agendaDuration?: number;
  /** The default is `'auto'`. */
  scrolling?: ScrollingMode;
}
