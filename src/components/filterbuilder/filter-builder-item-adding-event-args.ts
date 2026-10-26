import type { EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderItem } from './filter-builder-item';

/** A condition or a group is about to be added to `group`; change `item` (its field, operation, value), or `cancel`. */
export interface FilterBuilderItemAddingEventArgs extends EventArgs {
  item: FilterBuilderItem;
  group: FilterBuilderGroup;
  byUser: boolean;
  source: FilterBuilder;
}
