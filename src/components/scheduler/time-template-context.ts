import type { SchedulerViewType } from './scheduler-view-type';

/**
 * The context of a time template: an hour of the time ruler or of a timeline scale, and the text
 * the scheduler would display.
 */
export interface TimeTemplateContext {
  /** The hour on the day it represents, which is the first displayed day in a day view. */
  readonly date: Date;
  /** The minutes after the start of the day. */
  readonly minutes: number;
  /** The text, such as "09:00" or "9 AM", based on the locale. */
  readonly text: string;
  readonly view: SchedulerViewType;
}
