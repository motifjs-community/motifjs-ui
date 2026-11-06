import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs when the manager's active document changes: another tab, or another group. */
export interface DocumentActivatedEventArgs {
  document: TabDocument | null;
  previous: TabDocument | null;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
