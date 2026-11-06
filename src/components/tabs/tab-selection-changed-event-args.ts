import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

export interface TabSelectionChangedEventArgs {
  /** `null` when the last tab was removed. */
  tab: Tab | null;
  index: number;
  previousTab: Tab | null;
  previousIndex: number;
  /** `true` when the user selected the tab, and `false` when it was selected programmatically. */
  byUser: boolean;
  source: Tabs;
  event?: Event;
}
