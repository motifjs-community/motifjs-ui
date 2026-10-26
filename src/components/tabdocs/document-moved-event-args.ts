import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

export interface DocumentMovedEventArgs {
  document: TabDocument;
  from: TabGroup;
  fromIndex: number;
  to: TabGroup;
  toIndex: number;
  byUser: boolean;
  source: TabDocumentManager;
}
