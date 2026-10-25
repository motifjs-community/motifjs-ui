import type { EventArgs } from '@motifx/core';
import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

/** The user is about to select a tab; `cancel = true` keeps the current one. */
export interface TabSelectingEventArgs extends EventArgs {
  tab: Tab;
  index: number;
  previousTab: Tab | null;
  previousIndex: number;
  source: Tabs;
  event?: Event;
}
