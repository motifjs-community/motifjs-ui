import type { EventArgs } from '@motifx/core';
import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a group, or the whole layout along an edge, is split. Set `cancel = true` to keep the layout. */
export interface GroupSplittingEventArgs extends EventArgs {
  /** The group being split, or `null` when the new group runs along an edge of the whole layout. */
  group: TabGroup | null;
  direction: SplitDirection;
  /** The document that moves into the new group, if any. */
  document: TabDocument | null;
  /** Indicates that the document is copied into the new group (`splitCopies`) instead of moved. */
  copy: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
