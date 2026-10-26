import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';

/** The layout changed: groups were added, closed, resized, maximized or restored. */
export interface LayoutChangedEventArgs {
  change: TabLayoutChange;
  group: TabGroup | null;
  byUser: boolean;
  source: TabDocumentManager;
}
