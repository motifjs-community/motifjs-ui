import type { Bind } from '@motifx/core';
import type { SchedulerViewType } from './scheduler-view-type';

/**
 * One view the scheduler offers. Its own settings win over the scheduler's; every one is a value or
 * a function that is followed.
 */
export interface SchedulerView {
  type: SchedulerViewType;
  /** What `currentView` and the view switcher call it; the type by default. Two views of one type need names. */
  name?: string;
  /** The caption in the view switcher; the type's text by default. */
  text?: Bind<string>;
  /** How many days (`day`), weeks (`week`, `workWeek`) or months (`month`) it shows. Default 1. */
  intervalCount?: Bind<number>;
  startDayHour?: Bind<number>;
  endDayHour?: Bind<number>;
  /** Minutes in a cell. */
  cellDuration?: Bind<number>;
  allDayPanel?: Bind<boolean>;
  /** Appointments shown in a month cell (or the all-day panel) before "+N more"; `'auto'`: as many as fit. */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
}
