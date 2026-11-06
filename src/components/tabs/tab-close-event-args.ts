import type { EventArgs } from '@motifx/core';
import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

/**
 * Provides data for the event that occurs before a tab closes. Set `cancel = true` to keep it, for example to confirm
 * unsaved work.
 */
export interface TabCloseEventArgs extends EventArgs {
  tab: Tab;
  index: number;
  byUser: boolean;
  source: Tabs;
  event?: Event;
}
