import type { DataGrid } from './DataGrid';

/**
 * A row is dragged (`rowDragging`'s `onDragStart`, `onDragMove`, `onDragChange`, `onDragEnd`), with
 * the mouse, a pen, a finger on the drag icon or the keys that move a row; `cancel` stops it: at the
 * start the row is not dragged, while it moves the place under the pointer takes no drop, at the end
 * nothing is dropped. Indexes are the grid's row indexes (as `focusedRowIndex` and
 * `getVisibleRows()` count them); `toIndex` is where the row would be after the drop, -1 while it is
 * over no grid that takes it.
 */
export interface GridRowDragEventArgs<T = any> {
  /** The grid that raised the event. */
  readonly component: DataGrid<T>;
  /** The grid the row comes from. */
  readonly fromComponent: DataGrid<T>;
  /** The grid under the pointer that takes the row, or `null`; the same grid while reordering. */
  readonly toComponent: DataGrid<T> | null;
  /** The row dragged. */
  readonly itemData: T;
  /** Its key, when it has one. */
  readonly itemKey: unknown;
  /** Its element in the grid it comes from. */
  readonly itemElement: HTMLElement;
  readonly fromIndex: number;
  readonly toIndex: number;
  /** The row at `toIndex` before the drop (the dragged row lands just before it, or after it when it comes from above); `undefined` at the end or on a group row. */
  readonly toItemData: T | undefined;
  /** Dropped onto the row at `toIndex` (`allowDropInsideItem`), not between rows. */
  readonly dropInsideItem: boolean;
  /** `rowDragging.data` of the grid it comes from. */
  readonly fromData: unknown;
  /** `rowDragging.data` of the grid under the pointer. */
  readonly toData: unknown;
  /** The pointer or key event behind it. */
  readonly event: Event | undefined;
  cancel: boolean;
}
