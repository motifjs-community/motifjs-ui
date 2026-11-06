/** A day of the week in a rule (`BYDAY`): `MO`, or with its place in the month or the year, `2MO`, `-1FR`. */
export interface RuleWeekday {
  /** 0 Sunday … 6 Saturday. */
  day: number;
  /** Its position: 2 is the second, -1 is the last, and 0 is every one. */
  nth: number;
}
