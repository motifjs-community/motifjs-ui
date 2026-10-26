import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

export interface GroupSplitEventArgs {
  group: TabGroup;
  newGroup: TabGroup;
  direction: SplitDirection;
  document: TabDocument | null;
  byUser: boolean;
  source: TabDocumentManager;
}
