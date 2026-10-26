import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** The manager's active document changed: another tab, or another group. */
export interface DocumentActivatedEventArgs {
  document: TabDocument | null;
  previous: TabDocument | null;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
