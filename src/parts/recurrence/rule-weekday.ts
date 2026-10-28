/** A day of the week in a rule (`BYDAY`): `MO`, or with its place in the month or the year, `2MO`, `-1FR`. */
export interface RuleWeekday {
  /** 0 Sunday … 6 Saturday. */
  day: number;
  /** Its place: 2 the second, -1 the last; 0 every one. */
  nth: number;
}
