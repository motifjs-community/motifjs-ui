import type { TabDockArea } from './TabDockArea';
import type { TabDocumentManager } from './TabDocumentManager';

/** Occurs after a dock area collapses to its edge (`on`) or is restored. */
export interface TabAutoHiddenEventArgs {
  area: TabDockArea;
  on: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
