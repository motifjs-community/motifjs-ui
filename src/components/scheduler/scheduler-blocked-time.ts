/**
 * A time nothing may be put in: a lunch break, a room under repair. It is shaded on the days
 * shown; with `resources`, only for those (`{ roomId: 2 }`, or a list of values).
 */
export interface SchedulerBlockedTime {
  start: Date;
  end: Date;
  /** Read out with the cells it covers. */
  text?: string;
  /** Whole days, from the day of `start` up to the day of `end`. */
  allDay?: boolean;
  /** It repeats by an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`), on the scheduler's clock. */
  recurrenceRule?: string;
  /** The resources it is for, by field; left out, it is for every one. */
  resources?: Record<string, unknown>;
}
