import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A tab or a group is about to be dragged (or moved with "Move to…"); `cancel = true` leaves it. */
export interface TabDragStartingEventArgs extends EventArgs {
  /** The document; `null` when the whole group is dragged. */
  document: TabDocument | null;
  group: TabGroup;
  /** `'mouse'`, `'touch'`, `'pen'`, or `'keyboard'` for "Move to…". */
  pointerType: string;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
