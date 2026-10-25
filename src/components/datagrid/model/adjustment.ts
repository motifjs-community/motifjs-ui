/** A keyboard move or resize of a column, started from the column menu. */
export interface Adjustment {
  kind: 'move' | 'resize';
  field: string;
  /** Order (move) or width (resize) before it started, for Escape. */
  original: string[] | number;
}
