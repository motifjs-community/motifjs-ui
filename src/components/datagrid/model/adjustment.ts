/** A keyboard move or resize of a column, started from the column menu. */
export interface Adjustment {
  kind: 'move' | 'resize';
  field: string;
  /** Order (move) or widths and flex shares (resize) before it started, for Escape. */
  original: string[] | { width: Record<string, number>; flex: Record<string, number> };
}
