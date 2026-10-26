import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';
import type { TabWindow } from './TabWindow';

/** A document, a group or a floating window is about to move into a new browser window; `rect` and `url` may be changed, `cancel = true` keeps it where it is. */
export interface TabWindowOpeningEventArgs extends EventArgs {
  /** The document; `null` when a whole group or a floating window moves. */
  document: TabDocument | null;
  /** The document's group, the group that moves, or the floating window's active group. */
  group: TabGroup;
  /** The floating window that moves with everything in it, if one. */
  window: TabWindow | null;
  /** The window's place and size on the screen. */
  rect: TabRect;
  /** The page the window opens. */
  url: string;
  byUser: boolean;
  source: TabDocumentManager;
}
