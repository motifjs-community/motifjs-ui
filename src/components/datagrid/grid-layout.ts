import type { data } from '@motifx-community/data';
import type { ColumnLayout } from './column-layout';

/**
 * Column order, widths, visibility, sticky sides, sort order and grouping. Read it from `grid.layout`,
 * store it wherever you like, and give it back through the `layout` prop or `grid.layout = …`.
 */
export interface GridLayout {
  /** Every column, in display order. */
  columns: ColumnLayout[];
  sort: data.SortItem[];
  /** The grouped columns, in order, with the order of their groups. Left out: as the columns say (`groupIndex`). */
  group?: data.GroupItem[];
}
