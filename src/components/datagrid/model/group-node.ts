/** A group of the grid's rows: its key in its level, how many rows it holds and where they start. */
export interface GroupNode {
  /** The keys from the top level down, as one text: it names the group across loads. */
  id: string;
  /** 0 for the top level. */
  level: number;
  /** The grouped column. */
  field: string;
  /** The value its rows share; `null` for empty values. */
  key: unknown;
  /** The keys from the top level down to this group. */
  path: unknown[];
  /** Rows in the group, all levels below included. */
  count: number;
  /** Index of its first row among the rows in group order. */
  start: number;
  /** The groups of the next level; `null` in the last level, whose rows come next. */
  children: GroupNode[] | null;
  /** The group summary values a server gave with the group, in the order they were asked for. */
  summary?: unknown[];
}
