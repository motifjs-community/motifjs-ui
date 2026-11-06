/**
 * A time when nothing can be scheduled, such as a lunch break or a room under repair. It is shaded on
 * the visible days and, with `resources`, only for those resources (`{ roomId: 2 }`, or a list of values).
 */
export interface SchedulerBlockedTime {
  start: Date;
  end: Date;
  /** Announced to screen readers with the cells it covers. */
  text?: string;
  /** Blocks whole days, from the day of `start` to the day of `end`. */
  allDay?: boolean;
  /** Repeats by an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`), in the scheduler's time zone. */
  recurrenceRule?: string;
  /** The resources it applies to, by field. If omitted, it applies to every resource. */
  resources?: Record<string, unknown>;
}
