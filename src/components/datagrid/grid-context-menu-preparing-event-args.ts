import type { EventArgs } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';

/**
 * Occurs before a menu opens: a header's column menu (`target: 'header'`), or a row's menu on a
 * right-click or the context menu key (`target: 'row'`, which opens only if `items` has items). Change
 * `items` (add, remove or reorder). Set `cancel = true` to open nothing.
 */
export interface GridContextMenuPreparingEventArgs<T> extends EventArgs {
  readonly target: 'header' | 'row';
  readonly field: string;
  /** With `'row'`, the row, or `undefined` on a group row. */
  readonly row?: T;
  readonly rowIndex: number;
  items: MenuItem[];
}
