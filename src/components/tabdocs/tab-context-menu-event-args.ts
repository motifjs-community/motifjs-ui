import type { EventArgs } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * A context menu is about to open on a tab (`document`) or on the empty strip (`document` is
 * `null`). `items` may be changed or replaced; `cancel = true` opens none.
 */
export interface TabContextMenuEventArgs extends EventArgs {
  document: TabDocument | null;
  group: TabGroup;
  items: MenuItem[];
  byKeyboard: boolean;
  source: TabDocumentManager;
}
