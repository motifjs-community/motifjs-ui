import type { GridColumn } from './grid-column';

/** A column of a `GridSheet`: a visible, exportable column, in display order. */
export interface GridSheetColumn<T = any> {
  readonly field: string;
  readonly column: GridColumn<T>;
  readonly title: string;
  /** Its width on screen, in pixels. */
  readonly width: number;
  readonly align: 'start' | 'center' | 'end';
  /** The `Intl` options its numbers show with; `undefined` when it is no number column or its `format` is a function. */
  readonly numberFormat?: Intl.NumberFormatOptions;
  /** The `Intl` options its dates show with; `undefined` when it is no date column or its `format` is a function. */
  readonly dateFormat?: Intl.DateTimeFormatOptions;
}
