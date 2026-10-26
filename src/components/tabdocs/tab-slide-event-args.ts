import type { EventArgs } from '@motifx/core';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';

/**
 * A folded dock area is about to slide out over the documents with `document` (`open`), or to slide
 * back (`onSlideChanging`; `cancel = true` leaves it); or it did (`onSlideChanged`).
 */
export interface TabSlideEventArgs extends EventArgs {
  area: TabDockArea;
  /** The document shown; `null` when it slides back. */
  document: TabDocument | null;
  open: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
