import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/**
 * Occurs before a document or whole group floats in its own window. `rect` can be changed. Set
 * `cancel = true` to keep it in place.
 */
export interface TabFloatingEventArgs extends EventArgs {
  /** The document, or `null` when a whole group floats. */
  document: TabDocument | null;
  /** The document's group, or the group that floats. */
  group: TabGroup;
  /** Where the window opens. */
  rect: TabRect;
  byUser: boolean;
  source: TabDocumentManager;
}
