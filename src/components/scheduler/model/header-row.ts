import type { HeaderCell } from './header-cell';

/** A row of group heads: one level of the groups. */
export interface HeaderRow {
  level: number;
  /** The kind's name, read out with it. */
  label: string;
  cells: HeaderCell[];
}
