/** A `STANDARD` or `DAYLIGHT` part of a `VTIMEZONE`: the offset that applies from its onsets on. */
export interface ICalendarObservance {
  kind: 'standard' | 'daylight';
  /** The first onset (`DTSTART`) as a wall clock time, in the offset before it. */
  start: number;
  /** Minutes east of UTC before and after an onset. */
  offsetFrom: number;
  offsetTo: number;
  /** `TZNAME`, or empty if there is none. */
  name: string;
  /** The `RRULE` of later onsets, or empty if there is none. */
  rule: string;
  /** Additional onsets (`RDATE`) as wall clock times. */
  dates: number[];
}
