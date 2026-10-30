/** An appointment in a row of a timeline, on its lane (stacked under the ones at the same time). Kept while it stays on screen. */
export interface LinePiece<T> {
  id: string;
  /** Moves on when its appointment was read again (a refresh, an edit) or is another object: what shows it reads it again. The appointment itself is the model's `itemOf(piece)`. */
  version: number;
  /** The row it is in (its group's index, -1 without groups). */
  group: number;
  /** The appointment's time (its box may show only part of it). */
  start: Date;
  end: Date;
  allDay: boolean;
  /** Where it starts along the row and how far it goes, in cells (a share of a cell for a time inside one). */
  from: number;
  span: number;
  /** Its lane in the row, from 0. */
  lane: number;
  /** Lanes past what the row has room for are left out ("+N more"). */
  hidden: boolean;
  /** It began before what is shown, or goes on after it. */
  before: boolean;
  after: boolean;
  draft: boolean;
  invalid: boolean;
  text: string;
  color: string;
  disabled: boolean;
  series: boolean;
  exception: boolean;
}
