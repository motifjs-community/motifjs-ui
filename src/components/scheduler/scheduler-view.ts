import type { Bind } from '@motifx/core';
import type { ScrollingMode } from './model/scrolling-mode';
import type { SchedulerTemplates } from './scheduler-templates';
import type { SchedulerViewType } from './scheduler-view-type';

/**
 * One view the scheduler offers. Its own settings and templates take precedence over the scheduler's,
 * and each setting is a value or a tracked function.
 */
export interface SchedulerView<T = any> extends SchedulerTemplates<T> {
  type: SchedulerViewType;
  /** Its name for `currentView` and the view switcher. The default is the type. Two views of one type need names. */
  name?: string;
  /** The caption in the view switcher. The default is the type's text. */
  text?: Bind<string>;
  /**
   * The number of days (`day`, `timelineDay`), weeks (`week`, `workWeek`, `timelineWeek`,
   * `timelineWorkWeek`) or months (`month`, `timelineMonth`) shown. The default is 1.
   */
  intervalCount?: Bind<number>;
  /**
   * With an `intervalCount` greater than 1, and for the agenda, the date intervals are counted from,
   * so that they stay in place when the date changes.
   */
  startDate?: Bind<Date | null>;
  startDayHour?: Bind<number>;
  endDayHour?: Bind<number>;
  /** The duration of a cell, in minutes. */
  cellDuration?: Bind<number>;
  allDayPanel?: Bind<boolean>;
  /**
   * The number of appointments in a month cell, the all-day panel or a timeline row before "+N more".
   * `'auto'` shows as many as fit, and a timeline row grows.
   */
  maxAppointmentsPerCell?: Bind<number | 'auto'>;
  /** The resource fields its columns, or a timeline's rows, are grouped by. `[]` means none. */
  groups?: Bind<readonly string[]>;
  groupByDate?: Bind<boolean>;
  /** The number of days the agenda shows. The default is 7. */
  agendaDuration?: Bind<number>;
  /**
   * Whether every cell and row is rendered, or only the visible ones. `'auto'` (the default) renders
   * only the visible ones above about 2,000 cells.
   */
  scrolling?: Bind<ScrollingMode>;
}
