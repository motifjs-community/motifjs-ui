/** An entry of a header filter's tree: a part of a date or a range of numbers, with the rows under it. */
export interface FilterTreeNode {
  /** The key the tree keeps it under. */
  id: string;
  /** What the column's filter keeps for it: `2024`, `'2024/3'`, a range's start, or `null` for empty values. */
  value: unknown;
  text: string;
  /** Rows under it, when the values come with counts. */
  count?: number;
  children?: FilterTreeNode[];
}
