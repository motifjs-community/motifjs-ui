import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A group is about to be locked or unlocked; `cancel = true` leaves it as it is. */
export interface GroupLockingEventArgs extends EventArgs {
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
