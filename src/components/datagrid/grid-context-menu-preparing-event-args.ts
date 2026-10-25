import type { EventArgs } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';

/**
 * A menu is about to open: a header's column menu (`target: 'header'`), or a row's menu on a right
 * click or the context menu key (`target: 'row'`, which opens only when `items` has something).
 * Change `items` (add, remove, reorder); `cancel` opens nothing.
 */
export interface GridContextMenuPreparingEventArgs<T> extends EventArgs {
  readonly target: 'header' | 'row';
  readonly field: string;
  /** `'row'`: the row; `undefined` on a group row. */
  readonly row?: T;
  readonly rowIndex: number;
  items: MenuItem[];
}
