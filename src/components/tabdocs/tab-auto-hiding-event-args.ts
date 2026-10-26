import type { EventArgs } from '@motifx/core';
import type { TabDockArea } from './TabDockArea';
import type { TabDocumentManager } from './TabDocumentManager';

/** A dock area is about to fold to its edge (`on`) or come back; `cancel = true` leaves it. */
export interface TabAutoHidingEventArgs extends EventArgs {
  area: TabDockArea;
  on: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
