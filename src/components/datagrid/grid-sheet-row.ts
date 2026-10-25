import type { GridSheetCell } from './grid-sheet-cell';

/** A row of a `GridSheet`, one cell per column. */
export interface GridSheetRow<T = any> {
  readonly rowType: 'header' | 'group' | 'data' | 'groupFooter' | 'totalFooter';
  /** Its outline level: 0 for the header, the totals and top groups; rows of a group one more than the group. */
  readonly level: number;
  readonly cells: readonly GridSheetCell<T>[];
}
