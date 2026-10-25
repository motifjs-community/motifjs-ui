/** A level the grid groups its rows by, as its data needs it. */
export interface GroupLevel {
  /** The grouped column. */
  field: string;
  dir: 'asc' | 'desc';
  /** The field a server groups by (a text `calculateGroupValue` or `textFrom`, else the column's); `null` when only memory can (a function reads the value). */
  serverField: string | null;
  /** How memory reads the value to group by; `undefined` reads the field. */
  read: ((row: unknown) => unknown) | undefined;
  /** How memory orders the groups (`groupCompare`); `undefined` by their values. */
  compare: ((a: unknown, b: unknown) => number) | undefined;
}
