/** An all-day or multi-day appointment drawn as a bar over a row of days (the all-day panel, a week of the month). */
export interface StripPiece<T> {
  id: string;
  item: T;
  /** The first day of the row it covers, and how many. */
  first: number;
  span: number;
  /** Its line in the row, from 0. */
  lane: number;
  /** Lines past what the row has room for are left out ("+N more"). */
  hidden: boolean;
  before: boolean;
  after: boolean;
  /** For a timed appointment shown in a month: its start time is written before the text. */
  timed: boolean;
  start: Date;
  end: Date;
  draft: boolean;
  invalid: boolean;
  /** The appointment's text, colour and whether it is disabled, as its box shows them. */
  text: string;
  color: string;
  disabled: boolean;
  /** An occurrence of a series, or one changed apart from its series. */
  series: boolean;
  exception: boolean;
}
