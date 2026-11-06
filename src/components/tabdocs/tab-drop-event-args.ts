import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropPlace } from './tab-drop-place';
import type { TabGroup } from './TabGroup';

/**
 * Occurs while a dragged document or group is over a position (`onDragOver`), or just before it is
 * dropped there (`onDropping`). The position can be changed. Set `cancel = true` to refuse it
 * (`onDragOver`) or to leave everything in place (`onDropping`).
 */
export interface TabDropEventArgs extends EventArgs, TabDropPlace {
  /** The document, or `null` when a whole group is dragged. */
  document: TabDocument | null;
  /** The source: the document's group, or the group being dragged. */
  from: TabGroup;
  /** Indicates that a copy opens there: the copy key is held and the document can be open twice. */
  copy: boolean;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
