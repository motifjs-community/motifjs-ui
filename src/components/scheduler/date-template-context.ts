import type { SchedulerViewType } from './scheduler-view-type';

/** What a date template gets: a day's head (a weekday in the month), and the texts the scheduler would write. */
export interface DateTemplateContext {
  readonly date: Date;
  /** "Mon" */
  readonly weekday: string;
  /** "27"; empty for a weekday of the month's head. */
  readonly number: string;
  readonly today: boolean;
  readonly view: SchedulerViewType;
  /** Under `groupByDate`, its group's resource values; otherwise `null`. */
  readonly resources: Record<string, unknown> | null;
}
