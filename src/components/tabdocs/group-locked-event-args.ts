import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A group was locked or unlocked. */
export interface GroupLockedEventArgs {
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
