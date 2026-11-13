/** What fitting a column to its content found: the width it takes, and the column that gives or takes the difference. */
export interface ColumnFit {
  field: string;
  width: number;
  /** The next column in `'nextColumn'` resize mode, else `undefined`. */
  next: string | undefined;
  /** The widths the column and `next` had together on screen; 0 without `next`. */
  total: number;
}
