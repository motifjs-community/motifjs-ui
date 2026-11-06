import type { SchedulerViewType } from './scheduler-view-type';

/** The context of an appointment template: the appointment and the part of it displayed at that position. */
export interface AppointmentTemplateContext<T> {
  appointment: T;
  start: Date;
  end: Date;
  /** The text the scheduler would display. */
  text: string;
  /** The time the scheduler would display. Empty for an all-day appointment. */
  time: string;
  allDay: boolean;
  view: SchedulerViewType;
  /** The resource values of the group containing this part, by field. `null` without groups. */
  group: Record<string, unknown> | null;
}
