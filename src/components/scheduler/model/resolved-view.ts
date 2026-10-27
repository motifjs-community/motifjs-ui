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
}
