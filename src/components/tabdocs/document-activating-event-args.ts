import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a tab becomes the active tab of its group. Set `cancel = true` to keep the current one. */
export interface DocumentActivatingEventArgs extends EventArgs {
  document: TabDocument;
  previous: TabDocument | null;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
