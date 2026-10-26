import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabLayoutChange } from './tab-layout-change';

/** The layout is about to change (a group closed, resized, maximized…); `cancel = true` keeps it. */
export interface LayoutChangingEventArgs extends EventArgs {
  change: TabLayoutChange;
  /** The group it is about, if one. */
  group: TabGroup | null;
  byUser: boolean;
  source: TabDocumentManager;
}
