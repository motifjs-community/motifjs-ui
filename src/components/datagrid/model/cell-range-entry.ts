import type { CellCorner } from './cell-corner';

/** A range as the grid keeps it: where it was started, its far corner, and the columns it covers. */
export interface CellRangeEntry {
  anchor: CellCorner;
  extent: CellCorner;
  fields: string[];
}
