import type { GridBand } from './grid-band';
import type { GridColumn } from './grid-column';

/**
 * A cell of the grid as seen by an export, passed to `customizeCell` with the written cell.
 */
export interface GridExportCell<T = any> {
  readonly rowType: 'header' | 'group' | 'data' | 'groupFooter' | 'totalFooter';
  /** The cell's column. In a group row's first cell, the grouped column. */
  readonly column?: GridColumn<T>;
  /** In a header cell of a band's row, the band it displays or is below. */
  readonly band?: GridBand<T>;
  /** The row object of a data cell. */
  readonly data?: T;
  /** The raw value: a data cell's value, a group's key, a summary item's value. */
  readonly value?: unknown;
  /** The level of a group row, 0 for the top. */
  readonly groupIndex?: number;
  /** The group summary items the cell displays: in the group text (first cell) or below their column. */
  readonly groupSummaryItems?: readonly { name: string | undefined; value: unknown }[];
  /** The summary item a footer cell displays: its `name`, otherwise `type_column`. */
  readonly totalSummaryItemName?: string;
}
