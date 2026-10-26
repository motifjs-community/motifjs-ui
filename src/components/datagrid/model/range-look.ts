import type { RangeBox } from './range-box';

/** What the rows need to draw the cell ranges and a drag's run, worked out once per change for all of them. */
export interface RangeLook {
  /** Cells can be selected (`cellSelection` is on). */
  on: boolean;
  boxes: RangeBox[];
  /** The visible data columns, in display order. */
  shown: string[];
  /** The columns whose cells can be selected. */
  selectable: Set<string>;
  /** The rows a drag selects now, and the first and last visible columns the run's frame goes to. */
  run: { top: number; bottom: number } | null;
  first: string;
  last: string;
}
