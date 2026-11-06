/** The context of an agenda row template: the appointment on the row's day. */
export interface AgendaRowContext<T> {
  readonly appointment: T;
  /** Its time on this day. */
  readonly start: Date;
  readonly end: Date;
  /** The text and the time the scheduler would display ("All day" for an all-day appointment). */
  readonly text: string;
  readonly time: string;
  /** Indicates that it takes the whole day. */
  readonly allDay: boolean;
  readonly date: Date;
  /** The resource values of the group it is listed under. `null` without groups. */
  readonly group: Record<string, unknown> | null;
}
