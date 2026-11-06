/** The options of `recurrenceDates`, besides the rule. */
export interface RecurrenceDatesOptions {
  /** Converts a moment (an `UNTIL` written in UTC) to the series' wall clock. By default, it is used as is. */
  wallOf?: (moment: number) => number;
  /** The maximum number of dates returned. The default is 10 000. */
  limit?: number;
}
