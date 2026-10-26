import type { Bind } from '@motifx/core';
import type { GridRowDragEventArgs } from './grid-row-drag-event-args';
import type { GridRowDropEventArgs } from './grid-row-drop-event-args';

/**
 * Rows moved by dragging them (`rowDragging`): within the grid (`allowReordering`),
 * onto a row (`allowDropInsideItem`), or to another grid of the same `group`. The grid shows where
 * the row would land and tells it in the events; your handlers move the data. Rows also move with
 * the keyboard (`moveUpKeys`, `moveDownKeys`) and with `moveRow()`. Every field but the handlers and
 * `dragTemplate` is a value or a function that is followed; read and change them later through
 * `grid.rowDragging`.
 */
export interface GridRowDragging<T = any> {
  /** Rows move within the grid. Default `false`. */
  allowReordering?: Bind<boolean>;
  /** A row can be dropped onto another (the middle of a row), for trees and details. Default `false`. */
  allowDropInsideItem?: Bind<boolean>;
  /** Where a drop would land: a line between rows (`'indicate'`), or the rows making room for it (`'push'`, not with `allowDropInsideItem`). Default `'indicate'`. */
  dropFeedbackMode?: Bind<'indicate' | 'push'>;
  /** A column of drag icons to drag rows by; off, the whole row is dragged. Default `true`. */
  showDragIcons?: Bind<boolean>;
  /** A CSS selector of what a row is dragged by, instead of the drag icon or the whole row. Default `''`. */
  handle?: Bind<string>;
  /** Grids of the same group take each other's rows (`onAdd` on the one dropped on, `onRemove` on the one it came from). */
  group?: Bind<string | undefined>;
  /** Anything of yours, handed to the events as `fromData` / `toData`. */
  data?: Bind<unknown>;
  /** Where the copy of the row may go: `'vertical'`, `'horizontal'` or `'both'`. Default `'both'`. */
  dragDirection?: Bind<'both' | 'vertical' | 'horizontal'>;
  /** An element (or a CSS selector) the dragged row stays inside. Default: none. */
  boundary?: Bind<string | HTMLElement | undefined>;
  /** An element (or a CSS selector) the copy of the row is shown in. Default: the grid. */
  container?: Bind<string | HTMLElement | undefined>;
  /** Where the copy sits from the pointer, `{ x, y }` (or `'x y'`). Default: where the row was taken, kept level with the rows. */
  cursorOffset?: Bind<{ x?: number; y?: number } | string | undefined>;
  /** Content of your own instead of the copy of the row: a component, an element or a text. */
  dragTemplate?: (e: { itemData: T; itemElement: HTMLElement }) => unknown;
  /** The rows scroll while the pointer is near their top or bottom edge. Default `true`. */
  autoScroll?: Bind<boolean>;
  /** Pixels scrolled per frame at the edge. Default `30`. */
  scrollSpeed?: Bind<number>;
  /** How near the edge, in pixels, scrolling starts. Default `60`. */
  scrollSensitivity?: Bind<number>;
  /** The keys move the active row too. Default `true`. */
  keyboard?: Bind<boolean>;
  /** Keys that move the active row up one place. Default `['Ctrl+Shift+ArrowUp']`. */
  moveUpKeys?: Bind<readonly string[]>;
  /** Keys that move the active row down one place. Default `['Ctrl+Shift+ArrowDown']`. */
  moveDownKeys?: Bind<readonly string[]>;
  /** Width of the drag icon column, in pixels. Default `36`. */
  columnWidth?: Bind<number>;
  /** A row is about to be dragged; `cancel` keeps it in place. */
  onDragStart?: (e: GridRowDragEventArgs<T>) => void;
  /** The row moved under the pointer; `cancel` takes no drop there. */
  onDragMove?: (e: GridRowDragEventArgs<T>) => void;
  /** The place the row would land changed; `cancel` takes no drop there. */
  onDragChange?: (e: GridRowDragEventArgs<T>) => void;
  /** The row is about to be dropped; `cancel` drops nothing. */
  onDragEnd?: (e: GridRowDragEventArgs<T>) => void;
  /** The row was dropped elsewhere in this grid: move it in the data. */
  onReorder?: (e: GridRowDropEventArgs<T>) => void;
  /** A row of another grid was dropped on this one: add it to the data. */
  onAdd?: (e: GridRowDropEventArgs<T>) => void;
  /** This grid's row was dropped on another one: take it out of the data. */
  onRemove?: (e: GridRowDropEventArgs<T>) => void;
}
