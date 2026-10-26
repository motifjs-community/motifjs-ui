import type { EventArgs } from '@motifx/core';
import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A group is about to be split (or the whole layout, along an edge); `cancel = true` keeps the layout. */
export interface GroupSplittingEventArgs extends EventArgs {
  /** The group split; `null` when the new group goes along an edge of the whole layout. */
  group: TabGroup | null;
  direction: SplitDirection;
  /** The document that goes into the new group, if any. */
  document: TabDocument | null;
  /** The document is copied into the new group (`splitCopies`), not moved. */
  copy: boolean;
  byUser: boolean;
  source: TabDocumentManager;
}
