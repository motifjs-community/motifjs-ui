import type { Bind } from '@motifx/core';
import type { GridRowDragEventArgs } from './grid-row-drag-event-args';
import type { GridRowDropEventArgs } from './grid-row-drop-event-args';

/**
 * Moves rows by dragging: within the grid (`allowReordering`), onto a row (`allowDropInsideItem`), or
 * to another grid of the same `group`. The grid shows where the row would land and reports it in the
 * events, and your handlers move the data. Rows also move with the keyboard (`moveUpKeys`,
 * `moveDownKeys`) and with `moveRow()`. Every field except the handlers and `dragTemplate` is a value
 * or a tracked function. Read and change them later through `grid.rowDragging`.
 */
export interface GridRowDragging<T = any> {
  /** Allows rows to move within the grid. The default is `false`. */
  allowReordering?: Bind<boolean>;
  /** Allows a row to be dropped onto another (the middle of a row), for trees and details. The default is `false`. */
  allowDropInsideItem?: Bind<boolean>;
  /**
   * How the drop position is shown: a line between rows (`'indicate'`), or the rows making room for it
   * (`'push'`, which does not apply with `allowDropInsideItem`). The default is `'indicate'`.
   */
  dropFeedbackMode?: Bind<'indicate' | 'push'>;
  /** Shows a column of drag icons to drag rows by. Otherwise, the whole row is dragged. The default is `true`. */
  showDragIcons?: Bind<boolean>;
  /** A CSS selector of what a row is dragged by, in place of the drag icon or the whole row. The default is `''`. */
  handle?: Bind<string>;
  /** Grids of the same group accept each other's rows (`onAdd` on the one dropped on, `onRemove` on the one it came from). */
  group?: Bind<string | undefined>;
  /** Custom data, passed to the events as `fromData` and `toData`. */
  data?: Bind<unknown>;
  /** The directions the copy of the row can move: `'vertical'`, `'horizontal'` or `'both'`. The default is `'both'`. */
  dragDirection?: Bind<'both' | 'vertical' | 'horizontal'>;
  /** An element or CSS selector the dragged row stays inside. By default, none. */
  boundary?: Bind<string | HTMLElement | undefined>;
  /** An element or CSS selector the copy of the row appears in. The default is the grid. */
  container?: Bind<string | HTMLElement | undefined>;
  /**
   * The offset of the copy from the pointer, `{ x, y }` or `'x y'`. By default, where the row was grabbed,
   * kept level with the rows.
   */
  cursorOffset?: Bind<{ x?: number; y?: number } | string | undefined>;
  /** Custom content in place of the copy of the row: a component, an element or text. */
  dragTemplate?: (e: { itemData: T; itemElement: HTMLElement }) => unknown;
  /** The rows scroll while the pointer is near their top or bottom edge. The default is `true`. */
  autoScroll?: Bind<boolean>;
  /** The pixels scrolled per frame at the edge. The default is `30`. */
  scrollSpeed?: Bind<number>;
  /** The distance from the edge, in pixels, at which scrolling starts. The default is `60`. */
  scrollSensitivity?: Bind<number>;
  /** Allows keys to move the active row. The default is `true`. */
  keyboard?: Bind<boolean>;
  /** Keys that move the active row up one place. The default is `['Ctrl+Shift+ArrowUp']`. */
  moveUpKeys?: Bind<readonly string[]>;
  /** Keys that move the active row down one place. The default is `['Ctrl+Shift+ArrowDown']`. */
  moveDownKeys?: Bind<readonly string[]>;
  /** The width of the drag icon column, in pixels. The default is `36`. */
  columnWidth?: Bind<number>;
  /** Occurs before a row is dragged. Set `cancel = true` to keep it in place. */
  onDragStart?: (e: GridRowDragEventArgs<T>) => void;
  /** Occurs when the row moves under the pointer. Set `cancel = true` to accept no drop there. */
  onDragMove?: (e: GridRowDragEventArgs<T>) => void;
  /** Occurs when the position where the row would land changes. Set `cancel = true` to accept no drop there. */
  onDragChange?: (e: GridRowDragEventArgs<T>) => void;
  /** Occurs before the row is dropped. Set `cancel = true` to drop nothing. */
  onDragEnd?: (e: GridRowDragEventArgs<T>) => void;
  /** Occurs when the row is dropped elsewhere in this grid. Move it in the data. */
  onReorder?: (e: GridRowDropEventArgs<T>) => void;
  /** Occurs when a row of another grid is dropped on this one. Add it to the data. */
  onAdd?: (e: GridRowDropEventArgs<T>) => void;
  /** Occurs when this grid's row is dropped on another grid. Remove it from the data. */
  onRemove?: (e: GridRowDropEventArgs<T>) => void;
}
