import type { SchedulerViewType } from './scheduler-view-type';

/** The context of a date template: a day header (a weekday in the month), and the text the scheduler would display. */
export interface DateTemplateContext {
  readonly date: Date;
  /** The weekday, such as "Mon". */
  readonly weekday: string;
  /** The day number, such as "27". Empty for a weekday in the month header. */
  readonly number: string;
  readonly today: boolean;
  readonly view: SchedulerViewType;
  /** With `groupByDate`, the resource values of its group. Otherwise `null`. */
  readonly resources: Record<string, unknown> | null;
}
