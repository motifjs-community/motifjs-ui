import type { GridRowDragEventArgs } from './grid-row-drag-event-args';

/**
 * A row was dropped (`rowDragging`'s `onReorder`, `onAdd`, `onRemove`). The grid does not move the
 * data itself: move the row in your array (`splice`) or tell the server (a field that holds the
 * order). Give `promise` for work that takes time: the grid waits for it, the drop marks shown.
 */
export interface GridRowDropEventArgs<T = any> extends Omit<GridRowDragEventArgs<T>, 'cancel'> {
  promise?: PromiseLike<unknown>;
}
