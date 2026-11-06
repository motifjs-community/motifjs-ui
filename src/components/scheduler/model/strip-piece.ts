/** An all-day or multi-day appointment drawn as a bar over a row of days (the all-day panel, a week of the month). */
export interface StripPiece<T> {
  id: string;
  /** Moves on when its appointment was read again (a refresh, an edit) or is another object: what shows it reads it again. The appointment itself is the model's `itemOf(piece)`. */
  version: number;
  /** The first column of the row it covers, and how many; the group's index (-1 without groups). */
  first: number;
  span: number;
  group: number;
  /** Its line in the row, from 0. */
  lane: number;
  /** Lines past what the row has room for are omitted ("+N more"). */
  hidden: boolean;
  before: boolean;
  after: boolean;
  /** For a timed appointment shown in a month: its start time is written before the text. */
  timed: boolean;
  start: Date;
  end: Date;
  draft: boolean;
  invalid: boolean;
  /** The appointment's text, color and whether it is disabled, as its box shows them. */
  text: string;
  color: string;
  disabled: boolean;
  /** An occurrence of a series, or one changed apart from its series. */
  series: boolean;
  exception: boolean;
}
