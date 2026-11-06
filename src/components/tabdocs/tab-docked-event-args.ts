import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';

/** Occurs after a document, group or window is docked. */
export interface TabDockedEventArgs {
  document: TabDocument | null;
  /** The group it ended up in. */
  group: TabGroup | null;
  /** The dock area it moved to, or `null` when it returned to the documents. */
  area: TabDockArea | null;
  side: TabDockSide | null;
  byUser: boolean;
  source: TabDocumentManager;
}
