import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A hidden document is in a group again. */
export interface DocumentShownEventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  byUser: boolean;
  source: TabDocumentManager;
}
