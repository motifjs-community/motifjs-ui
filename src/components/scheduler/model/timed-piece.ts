/** The part of an appointment shown in one day column, placed by the overlap layout. Kept while it stays on screen. */
export interface TimedPiece<T> {
  id: string;
  item: T;
  /** The column it stands in (a day, in a group), and the group's index (-1 without groups). */
  column: number;
  group: number;
  /** The part's own time, within the day. */
  start: Date;
  end: Date;
  /** Fractions of the column (0–1). */
  top: number;
  height: number;
  left: number;
  width: number;
  /** It began on an earlier day, or goes on after this one. */
  before: boolean;
  after: boolean;
  /** It is the appointment being moved or resized, shown where it would go. */
  draft: boolean;
  /** …where it may not go. */
  invalid: boolean;
  /** The appointment's text, colour and whether it is disabled, as its box shows them. */
  text: string;
  color: string;
  disabled: boolean;
  /** An occurrence of a series, or one changed apart from its series. */
  series: boolean;
  exception: boolean;
}
