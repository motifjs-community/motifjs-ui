import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a tab or group is dragged or moved with "Move to…". Set `cancel = true` to prevent it. */
export interface TabDragStartingEventArgs extends EventArgs {
  /** The document, or `null` when the whole group is dragged. */
  document: TabDocument | null;
  group: TabGroup;
  /** `'mouse'`, `'touch'`, `'pen'`, or `'keyboard'` for "Move to…". */
  pointerType: string;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
