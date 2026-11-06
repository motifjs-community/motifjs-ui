import type { EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderItem } from './filter-builder-item';

/**
 * Provides data for the event that occurs before a condition or group, with its contents, is removed from `group`.
 * `cancel` keeps it.
 */
export interface FilterBuilderItemRemovingEventArgs extends EventArgs {
  item: FilterBuilderItem;
  group: FilterBuilderGroup;
  byUser: boolean;
  source: FilterBuilder;
}
