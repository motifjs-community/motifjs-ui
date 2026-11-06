import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a group is locked or unlocked. Set `cancel = true` to leave it unchanged. */
export interface GroupLockingEventArgs extends EventArgs {
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
