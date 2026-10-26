import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

export interface GroupSplitEventArgs {
  /** The group split; `null` when the new group went along an edge of the whole layout. */
  group: TabGroup | null;
  newGroup: TabGroup;
  direction: SplitDirection;
  document: TabDocument | null;
  /** The copy of `document` opened in the new group, when it was copied. */
  copy: TabDocument | null;
  byUser: boolean;
  source: TabDocumentManager;
}
