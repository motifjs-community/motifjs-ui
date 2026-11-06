import type { EventArgs } from '@motifx/core';
import type { TabDockArea } from './TabDockArea';
import type { TabDocumentManager } from './TabDocumentManager';

/** Occurs before a dock area collapses to its edge (`on`) or is restored. Set `cancel = true` to prevent it. */
export interface TabAutoHidingEventArgs extends EventArgs {
  area: TabDockArea;
  on: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
