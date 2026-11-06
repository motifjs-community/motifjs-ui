import type { EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderItem } from './filter-builder-item';

/** A condition or a group (with what it holds) is about to be removed of `group`; `cancel` keeps it. */
export interface FilterBuilderItemRemovingEventArgs extends EventArgs {
  item: FilterBuilderItem;
  group: FilterBuilderGroup;
  byUser: boolean;
  source: FilterBuilder;
}
