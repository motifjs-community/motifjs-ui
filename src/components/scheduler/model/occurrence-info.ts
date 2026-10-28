/** Where an occurrence of a series comes from. */
export interface OccurrenceInfo<T> {
  series: T;
  /** The time the rule gives it, in the form of the start field (a moment, or the day of an all-day one); its `recurrenceId` in RFC 5545. */
  start: Date;
  /** Its key in the layout. */
  id: string;
}
