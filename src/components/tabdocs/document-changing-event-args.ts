import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A document is about to be kept open, pinned or unpinned; `cancel = true` leaves it as it is. */
export interface DocumentChangingEventArgs extends EventArgs {
  document: TabDocument;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
