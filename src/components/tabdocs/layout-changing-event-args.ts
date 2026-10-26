import type { EventArgs } from '@motifx/core';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';
import type { TabWindow } from './TabWindow';

/** The layout is about to change (a group closed, resized, maximized…); `cancel = true` keeps it. */
export interface LayoutChangingEventArgs extends EventArgs {
  change: TabLayoutChange;
  /** The group it is about, if one. */
  group: TabGroup | null;
  /** The floating window or the new browser window it is about, if one. */
  window?: TabWindow | TabBrowserWindow | null;
  /** The dock area it is about, if one. */
  area?: TabDockArea | null;
  byUser: boolean;
  source: TabDocumentManager;
}
