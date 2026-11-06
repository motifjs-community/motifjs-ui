import type { GridRowDragEventArgs } from './grid-row-drag-event-args';

/**
 * Occurs when a row is dropped (`rowDragging`'s `onReorder`, `onAdd`, `onRemove`). The grid does not
 * move the data, so move the row in your array (`splice`) or update the server (a field that holds the
 * order). Set `promise` for long-running work, and the grid waits for it with the drop marks displayed.
 */
export interface GridRowDropEventArgs<T = any> extends Omit<GridRowDragEventArgs<T>, 'cancel'> {
  promise?: PromiseLike<unknown>;
}
