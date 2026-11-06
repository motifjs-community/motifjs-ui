import type { data } from '@motifx-community/data';

/** Occurs after the grouping changes, by the user or programmatically. */
export interface GridGroupingChangedEventArgs {
  readonly group: readonly data.GroupItem[];
  readonly previous: readonly data.GroupItem[];
  readonly byUser: boolean;
}
