import type { EventArgs } from '@motifx/core';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * Occurs before a hidden document is shown again. Set `cancel = true` to keep it hidden. `group` and
 * `index` can be changed.
 */
export interface DocumentShowingEventArgs extends EventArgs {
  document: TabDocument;
  /** The group it moves into, or `null` when a dock area (`side`) or floating window is created for it. */
  group: TabGroup | null;
  /** The dock area it moves into, otherwise `null`. */
  side: TabDockSide | null;
  index: number;
  byUser: boolean;
  source: TabDocumentManager;
}
