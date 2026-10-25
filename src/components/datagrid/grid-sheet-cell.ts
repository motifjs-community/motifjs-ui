import type { GridExportCell } from './grid-export-cell';

/** A cell of a `GridSheet`. */
export interface GridSheetCell<T = any> {
  /** What to write: a number, a `Date`, `true` / `false`, a text, or `null` for an empty cell. */
  readonly value: string | number | boolean | Date | null;
  /** The text the grid shows for it. */
  readonly text: string;
  readonly gridCell: GridExportCell<T>;
}
