import type { TabDockArea } from './TabDockArea';
import type { TabDocumentManager } from './TabDocumentManager';

/** A dock area folded to its edge (`on`), or came back. */
export interface TabAutoHiddenEventArgs {
  area: TabDockArea;
  on: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
