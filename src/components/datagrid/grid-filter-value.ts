/** One entry of a header filter's value list. */
export interface GridFilterValue {
  /** The value, where `null` represents empty values. */
  value: unknown;
  /** The display text. By default, the value formatted like the column's cells. */
  text?: string;
  /** The number of rows with this value. */
  count?: number;
}
