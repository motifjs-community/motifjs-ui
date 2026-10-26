import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A document is about to open; `group` and `index` may be changed, `cancel = true` keeps it closed. */
export interface DocumentOpeningEventArgs extends EventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  active: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
