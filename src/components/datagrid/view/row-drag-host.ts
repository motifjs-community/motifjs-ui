import type { DataGrid } from '../DataGrid';
import type { DragGhost } from '../../../parts/drag/DragGhost';

/** What row dragging asks of the grid it works in. */
export interface RowDragHost<T> {
  readonly grid: DataGrid<T>;
  readonly ghost: DragGhost;
  /** The grid's own element. */
  root(): HTMLElement;
  viewport(): HTMLElement | null;
  /** Makes grid row `index` the active row, focus along while the grid has it. */
  focusRow(index: number): void;
  /** The grid's accessible name. */
  label(): string;
}
