import type { GridSheetCell } from './grid-sheet-cell';

/** A row of a `GridSheet`, one cell per column. */
export interface GridSheetRow<T = any> {
  readonly rowType: 'header' | 'group' | 'data' | 'groupFooter' | 'totalFooter';
  /** The outline level: 0 for the header, the totals and top groups, and one more than the group for its rows. */
  readonly level: number;
  readonly cells: readonly GridSheetCell<T>[];
}
