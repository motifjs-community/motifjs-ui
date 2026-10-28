/** What `recurrenceDates` may be told besides the rule. */
export interface RecurrenceDatesOptions {
  /** Turns a moment (an `UNTIL` written in UTC) into the series' wall clock. Default: it is taken as it is. */
  wallOf?: (moment: number) => number;
  /** The most dates it gives. Default 10 000. */
  limit?: number;
}
