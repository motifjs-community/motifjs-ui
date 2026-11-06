import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs after a group is locked or unlocked. */
export interface GroupLockedEventArgs {
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
