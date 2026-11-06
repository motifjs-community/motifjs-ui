import type { EventArgs } from '@motifx/core';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';

/**
 * Occurs before a collapsed dock area slides out over the documents with `document` (`open`) or slides
 * back (`onSlideChanging`, where `cancel = true` prevents it), and afterward (`onSlideChanged`).
 */
export interface TabSlideEventArgs extends EventArgs {
  area: TabDockArea;
  /** The document shown, or `null` when it slides back. */
  document: TabDocument | null;
  open: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
