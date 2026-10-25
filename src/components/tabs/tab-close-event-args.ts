import type { EventArgs } from '@motifx/core';
import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

/** A tab is about to close; `cancel = true` keeps it (to ask about unsaved work first, say). */
export interface TabCloseEventArgs extends EventArgs {
  tab: Tab;
  index: number;
  byUser: boolean;
  source: Tabs;
  event?: Event;
}
