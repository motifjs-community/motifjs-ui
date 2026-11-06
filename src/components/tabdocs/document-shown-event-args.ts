import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs after a hidden document returns to a group. */
export interface DocumentShownEventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  byUser: boolean;
  source: TabDocumentManager;
}
