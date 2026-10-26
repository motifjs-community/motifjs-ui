import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A document is about to move, in its group or to another one; `cancel = true` keeps it where it is. */
export interface DocumentMovingEventArgs extends EventArgs {
  document: TabDocument;
  from: TabGroup;
  fromIndex: number;
  to: TabGroup;
  toIndex: number;
  byUser: boolean;
  source: TabDocumentManager;
}
