import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A drag (or "Move to…") is over: dropped, or canceled and everything put back. */
export interface TabDragEndedEventArgs {
  document: TabDocument | null;
  from: TabGroup;
  dropped: boolean;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
