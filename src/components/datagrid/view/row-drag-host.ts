import type { ComponentBase } from '@motifx/core';
import type { DataGrid } from '../DataGrid';
import type { DragGhost } from '../../../parts/drag/DragGhost';

/** What row dragging asks of the grid it works in. */
export interface RowDragHost<T> {
  readonly grid: DataGrid<T>;
  readonly ghost: DragGhost;
  /** Id of the grid, for the ghost's rows to read the grid's column styles. */
  readonly gridId?: string;
  /** The part over the rows (headers and filter row) once the grid has drawn it, else `null`. */
  head?(): ComponentBase | null;
  /** Makes grid row `index` the active row, focus along while the grid has it. */
  focusRow(index: number): void;
  /** The grid's accessible name. */
  label(): string;
}
