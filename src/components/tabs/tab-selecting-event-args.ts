import type { EventArgs } from '@motifx/core';
import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

/** Provides data for the event that occurs before the user selects a tab. Set `cancel = true` to keep the current tab. */
export interface TabSelectingEventArgs extends EventArgs {
  tab: Tab;
  index: number;
  previousTab: Tab | null;
  previousIndex: number;
  source: Tabs;
  event?: Event;
}
