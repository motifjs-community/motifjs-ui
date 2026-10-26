import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/** A document, a group or a whole floating window is about to be docked; `side` and `size` may be changed, `cancel = true` leaves it. */
export interface TabDockingEventArgs extends EventArgs {
  /** The document; `null` for a group or a window. */
  document: TabDocument | null;
  /** The document's group, or the group docked; `null` for a whole window. */
  group: TabGroup | null;
  /** The window docked, or the window the document or the group is in. */
  window: TabWindow | null;
  /** The dock area it goes to; `null` puts it back where it was docked last. */
  side: TabDockSide | null;
  /** The size of a new dock area (pixels, or a share such as `'25%'`); `null` for the manager's `dockAreaSize`. */
  size: number | string | null;
  byUser: boolean;
  source: TabDocumentManager;
}
