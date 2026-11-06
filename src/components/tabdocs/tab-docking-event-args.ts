import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/**
 * Occurs before a document, group or whole floating window is docked. `side` and `size` can be changed.
 * Set `cancel = true` to prevent it.
 */
export interface TabDockingEventArgs extends EventArgs {
  /** The document, or `null` for a group or window. */
  document: TabDocument | null;
  /** The document's group or the docked group, or `null` for a whole window. */
  group: TabGroup | null;
  /** The docked window, or the window that contains the document or group. */
  window: TabWindow | null;
  /** The dock area it moves to, or `null` to return it to where it was last docked. */
  side: TabDockSide | null;
  /** The size of a new dock area, in pixels or as a share such as `'25%'`. `null` uses the manager's `dockAreaSize`. */
  size: number | string | null;
  byUser: boolean;
  source: TabDocumentManager;
}
