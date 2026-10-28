import type { SchedulerViewType } from './scheduler-view-type';

/** What an appointment template gets: the appointment and the part of it shown where the template is. */
export interface AppointmentTemplateContext<T> {
  appointment: T;
  start: Date;
  end: Date;
  /** The text the scheduler would write. */
  text: string;
  /** The time the scheduler would write (empty for an all-day appointment). */
  time: string;
  allDay: boolean;
  view: SchedulerViewType;
  /** The resource values of the group the piece stands in, by field; `null` without groups. */
  group: Record<string, unknown> | null;
}
