import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/** A document or a whole group is about to float in a window of its own; `rect` may be changed, `cancel = true` keeps it where it is. */
export interface TabFloatingEventArgs extends EventArgs {
  /** The document; `null` when a whole group floats. */
  document: TabDocument | null;
  /** The document's group, or the group that floats. */
  group: TabGroup;
  /** Where the window opens. */
  rect: TabRect;
  byUser: boolean;
  source: TabDocumentManager;
}
