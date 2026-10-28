/** An appointment on a day of the agenda (one that lasts days is on each of them). Kept while it stays on screen. */
export interface AgendaPiece<T> {
  id: string;
  item: T;
  /** The group it is listed under (-1 without groups). */
  group: number;
  /** Its time on this day; `whole`: it takes the day (all day, or going on through it). */
  start: Date;
  end: Date;
  whole: boolean;
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
