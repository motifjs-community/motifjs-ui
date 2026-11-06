import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';
import type { TabWindow } from './TabWindow';

/**
 * Occurs before a document, group or floating window moves into a new browser window. `rect` and `url`
 * can be changed. Set `cancel = true` to keep it in place.
 */
export interface TabWindowOpeningEventArgs extends EventArgs {
  /** The document, or `null` when a whole group or floating window moves. */
  document: TabDocument | null;
  /** The document's group, the group that moves, or the floating window's active group. */
  group: TabGroup;
  /** The floating window that moves with its contents, if any. */
  window: TabWindow | null;
  /** The window's position and size on the screen. */
  rect: TabRect;
  /** The page the window opens. */
  url: string;
  byUser: boolean;
  source: TabDocumentManager;
}
