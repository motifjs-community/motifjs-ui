import type { data } from '@motifx-community/data';
import type { BandLayout } from './band-layout';
import type { ColumnLayout } from './column-layout';

/**
 * The column order, widths, visibility, sticky sides, sort order and grouping. Read it from
 * `grid.layout`, store it anywhere, and restore it through the `layout` prop or `grid.layout = …`.
 */
export interface GridLayout {
  /** Every column, in display order. */
  columns: ColumnLayout[];
  /**
   * The bands that are hidden or pinned. Their position comes from their columns. When omitted, the
   * bands' own settings apply.
   */
  bands?: BandLayout[];
  sort: data.SortItem[];
  /** The grouped columns in order, with the order of their groups. When omitted, the columns' `groupIndex` applies. */
  group?: data.GroupItem[];
}
