import type { Bind } from '@motifx/core';
import type { ScrollingMode } from './model/scrolling-mode';
import type { SchedulerTemplates } from './scheduler-templates';
import type { SchedulerViewType } from './scheduler-view-type';

/**
 * One view the scheduler offers. Its own settings and templates take precedence over the scheduler's; every one
 * is a value or a tracked function.
 */
export interface SchedulerView<T = any> extends SchedulerTemplates<T> {
  type: SchedulerViewType;
  /** What `currentView` and the view switcher call it; the type by default. Two views of one type need names. */
  name?: string;
  /** The caption in the view switcher; the type's text by default. */
  text?: Bind<string>;
  /** How many days (`day`, `timelineDay`), weeks (`week`, `workWeek`, `timelineWeek`, `timelineWorkWeek`) or months (`month`, `timelineMonth`) it shows. Default 1. */
  intervalCount?: Bind<number>;
  /** With `intervalCount` over 1 (and for the agenda): the date the intervals are counted from, so they stay where they are when the date moves. */
  startDate?: Bind<Date | null>;
  startDayHour?: Bind<number>;
  endDayHour?: Bind<number>;
  /** Minutes in a cell. */
  cellDuration?: Bind<number>;
  allDayPanel?: Bind<boolean>;
  /** Appointments shown in a month cell (or the all-day panel, or a timeline row) before "+N more"; `'auto'`: as many as fit (a timeline row grows). */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
  /** The resource fields its columns (a timeline's rows) are grouped by; `[]` for none. */
  groups?: Bind<readonly string[]>;
  groupByDate?: Bind<boolean>;
  /** The days the agenda shows. Default 7. */
  agendaDuration?: Bind<number>;
  /** Whether it builds every cell and row or only what is in view; `'auto'` (default): only what is in view once the cells are many. */
  scrolling?: Bind<ScrollingMode>;
}
