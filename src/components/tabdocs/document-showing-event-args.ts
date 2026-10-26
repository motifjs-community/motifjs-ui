import type { EventArgs } from '@motifx/core';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * A hidden document is about to be shown again; `cancel = true` keeps it hidden. `group` and
 * `index` may be changed.
 */
export interface DocumentShowingEventArgs extends EventArgs {
  document: TabDocument;
  /** The group it goes into; `null` when a dock area (`side`) or a floating window is made for it. */
  group: TabGroup | null;
  /** The dock area it goes into, `null` elsewhere. */
  side: TabDockSide | null;
  index: number;
  byUser: boolean;
  source: TabDocumentManager;
}
