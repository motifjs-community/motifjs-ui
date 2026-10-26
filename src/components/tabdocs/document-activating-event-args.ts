import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A tab is about to become its group's active one; `cancel = true` keeps the current one. */
export interface DocumentActivatingEventArgs extends EventArgs {
  document: TabDocument;
  previous: TabDocument | null;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
