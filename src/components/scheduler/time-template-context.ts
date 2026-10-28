import type { SchedulerViewType } from './scheduler-view-type';

/** What a time template gets: an hour of the time ruler (or of a timeline's scale), and the text the scheduler would write. */
export interface TimeTemplateContext {
  /** The hour on the day it stands for (the first day shown, in a day view). */
  readonly date: Date;
  /** Minutes after the day's start. */
  readonly minutes: number;
  /** "09:00" or "9 AM", by the locale. */
  readonly text: string;
  readonly view: SchedulerViewType;
}
