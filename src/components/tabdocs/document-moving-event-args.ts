import type { EventArgs } from '@motifx/core';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs before a document moves, within its group or to another group. Set `cancel = true` to keep it in place. */
export interface DocumentMovingEventArgs extends EventArgs {
  document: TabDocument;
  from: TabGroup;
  fromIndex: number;
  to: TabGroup;
  toIndex: number;
  byUser: boolean;
  source: TabDocumentManager;
}
