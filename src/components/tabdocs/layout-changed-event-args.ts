import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabWindow } from './TabWindow';

/** Occurs after the layout changes: groups are added, closed, resized, maximized or restored. */
export interface LayoutChangedEventArgs {
  change: TabLayoutChange;
  group: TabGroup | null;
  /** The floating window or new browser window involved in the change, if any. */
  window?: TabWindow | TabBrowserWindow | null;
  /** The dock area involved in the change, if any. */
  area?: TabDockArea | null;
  byUser: boolean;
  source: TabDocumentManager;
}
