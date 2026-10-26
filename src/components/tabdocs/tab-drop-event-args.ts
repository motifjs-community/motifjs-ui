import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropPlace } from './tab-drop-place';
import type { TabGroup } from './TabGroup';

/**
 * A dragged document or group is over a place (`onDragOver`) or about to be dropped there
 * (`onDropping`). The place may be changed; `cancel = true` refuses it (over) or keeps everything
 * where it is (dropping).
 */
export interface TabDropEventArgs extends EventArgs, TabDropPlace {
  /** The document; `null` when a whole group is dragged. */
  document: TabDocument | null;
  /** Where it comes from: the document's group, or the group dragged. */
  from: TabGroup;
  /** A copy opens there (the copy key is held and the document may be open twice). */
  copy: boolean;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
