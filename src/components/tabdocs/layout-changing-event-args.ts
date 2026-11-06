import type { EventArgs } from '@motifx/core';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabWindow } from './TabWindow';

/** Occurs before the layout changes, such as when a group closes or is resized. Set `cancel = true` to keep it. */
export interface LayoutChangingEventArgs extends EventArgs {
  change: TabLayoutChange;
  /** The group involved in the change, if any. */
  group: TabGroup | null;
  /** The floating window or new browser window involved in the change, if any. */
  window?: TabWindow | TabBrowserWindow | null;
  /** The dock area involved in the change, if any. */
  area?: TabDockArea | null;
  byUser: boolean;
  source: TabDocumentManager;
}
