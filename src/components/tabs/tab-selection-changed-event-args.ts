import type { Tab } from './Tab';
import type { Tabs } from './Tabs';

export interface TabSelectionChangedEventArgs {
  /** `null` when the last tab went away. */
  tab: Tab | null;
  index: number;
  previousTab: Tab | null;
  previousIndex: number;
  /** `true` when the user selected it, `false` when code did. */
  byUser: boolean;
  source: Tabs;
  event?: Event;
}
