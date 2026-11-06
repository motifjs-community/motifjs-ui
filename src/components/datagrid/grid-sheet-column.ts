import type { GridColumn } from './grid-column';

/** A column of a `GridSheet`: a visible, exportable column, in display order. */
export interface GridSheetColumn<T = any> {
  readonly field: string;
  readonly column: GridColumn<T>;
  readonly title: string;
  /** The column's width on screen, in pixels. */
  readonly width: number;
  readonly align: 'start' | 'center' | 'end';
  /** The `Intl` options of its numbers, or `undefined` for a non-number column or a `format` function. */
  readonly numberFormat?: Intl.NumberFormatOptions;
  /** The `Intl` options of its dates, or `undefined` for a non-date column or a `format` function. */
  readonly dateFormat?: Intl.DateTimeFormatOptions;
}
