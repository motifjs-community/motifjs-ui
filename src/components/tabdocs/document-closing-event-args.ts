import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * A document is about to close. `cancel = true` keeps it; `promise` may be set to ask first (save
 * the changes?): the document closes when it resolves to `true`.
 */
export interface DocumentClosingEventArgs extends EventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  byUser: boolean;
  promise?: Promise<boolean>;
  source: TabDocumentManager;
}
