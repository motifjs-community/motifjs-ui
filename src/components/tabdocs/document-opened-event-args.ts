import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

export interface DocumentOpenedEventArgs {
  document: TabDocument;
  group: TabGroup;
  index: number;
  byUser: boolean;
  source: TabDocumentManager;
}
