/** One entry of a header filter's value list. */
export interface GridFilterValue {
  /** `null` stands for empty values. */
  value: unknown;
  /** Display text; default: the value formatted like the column's cells. */
  text?: string;
  /** Rows with this value. */
  count?: number;
}
