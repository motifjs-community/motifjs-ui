import type { ComponentBase } from '@motifx/core';
import type { DataGrid } from './DataGrid';

/**
 * Occurs while a row is dragged (`rowDragging`'s `onDragStart`, `onDragMove`, `onDragChange`,
 * `onDragEnd`), with the mouse, a pen, a finger on the drag icon or the keys that move a row. With
 * `cancel`, the row is not dragged at the start, the position under the pointer accepts no drop during
 * the move, and nothing is dropped at the end. Indexes are the grid's row indexes (as `focusedRowIndex`
 * and `getVisibleRows()` count them). `toIndex` is where the row would be after the drop, or -1 while
 * it is over no grid that accepts it.
 */
export interface GridRowDragEventArgs<T = any> {
  /** The grid that raised the event. */
  readonly component: DataGrid<T>;
  /** The grid the row comes from. */
  readonly fromComponent: DataGrid<T>;
  /** The grid under the pointer that accepts the row, or `null`. The same grid while reordering. */
  readonly toComponent: DataGrid<T> | null;
  /** The row dragged. */
  readonly itemData: T;
  /** The row's key, when it has one. */
  readonly itemKey: unknown;
  /** The row's part in the grid it comes from. */
  readonly itemPart: ComponentBase;
  readonly fromIndex: number;
  readonly toIndex: number;
  /**
   * The row at `toIndex` before the drop (the dragged row lands just before it, or after it when it
   * comes from above), or `undefined` at the end or on a group row.
   */
  readonly toItemData: T | undefined;
  /** Indicates a drop onto the row at `toIndex` (`allowDropInsideItem`), not between rows. */
  readonly dropInsideItem: boolean;
  /** `rowDragging.data` of the grid it comes from. */
  readonly fromData: unknown;
  /** `rowDragging.data` of the grid under the pointer. */
  readonly toData: unknown;
  /** The pointer or key event that caused it. */
  readonly event: Event | undefined;
  cancel: boolean;
}
