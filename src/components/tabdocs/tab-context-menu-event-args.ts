import type { EventArgs } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * Occurs before a context menu opens on a tab (`document`) or on the empty strip (`document` is
 * `null`). `items` can be changed or replaced. Set `cancel = true` to open no menu.
 */
export interface TabContextMenuEventArgs extends EventArgs {
  document: TabDocument | null;
  group: TabGroup;
  items: MenuItem[];
  byKeyboard: boolean;
  source: TabDocumentManager;
}
