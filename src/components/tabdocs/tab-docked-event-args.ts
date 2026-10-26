import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDockArea } from './TabDockArea';
import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';

/** A document, a group or a window was docked. */
export interface TabDockedEventArgs {
  document: TabDocument | null;
  /** The group it ended up in. */
  group: TabGroup | null;
  /** The dock area it went to; `null` when it went back among the documents. */
  area: TabDockArea | null;
  side: TabDockSide | null;
  byUser: boolean;
  source: TabDocumentManager;
}
