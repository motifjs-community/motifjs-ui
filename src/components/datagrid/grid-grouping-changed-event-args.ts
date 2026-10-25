import type { data } from '@motifx-community/data';

/** The grouping changed (by the user or from code). */
export interface GridGroupingChangedEventArgs {
  readonly group: readonly data.GroupItem[];
  readonly previous: readonly data.GroupItem[];
  readonly byUser: boolean;
}
