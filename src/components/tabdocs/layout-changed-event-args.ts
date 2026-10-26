import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabWindow } from './TabWindow';

/** The layout changed: groups were added, closed, resized, maximized or restored. */
export interface LayoutChangedEventArgs {
  change: TabLayoutChange;
  group: TabGroup | null;
  /** The floating window or the new browser window it is about, if one. */
  window?: TabWindow | TabBrowserWindow | null;
  /** The dock area it is about, if one. */
  area?: TabDockArea | null;
  byUser: boolean;
  source: TabDocumentManager;
}
