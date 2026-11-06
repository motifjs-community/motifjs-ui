import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs when a drag or "Move to…" ends, either dropped or canceled with everything restored. */
export interface TabDragEndedEventArgs {
  document: TabDocument | null;
  from: TabGroup;
  dropped: boolean;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
