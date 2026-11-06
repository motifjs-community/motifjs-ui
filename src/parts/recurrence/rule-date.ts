/**
 * A date of a rule (`UNTIL`, `EXDATE`). `time` holds the written fields as milliseconds of UTC
 * (`Date.UTC`): with `utc` it is a moment, without it a time on the wall clock of the series.
 */
export interface RuleDate {
  time: number;
  utc: boolean;
  /** A date only (`20261031`), with no time. */
  dateOnly: boolean;
}
