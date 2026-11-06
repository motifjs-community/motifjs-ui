import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a document opens. `group` and `index` can be changed. Set `cancel = true` to keep it closed. */
export interface DocumentOpeningEventArgs extends EventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  active: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
