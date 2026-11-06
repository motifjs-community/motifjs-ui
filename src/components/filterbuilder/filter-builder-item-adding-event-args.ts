import type { EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderItem } from './filter-builder-item';

/**
 * Provides data for the event that occurs before a condition or group is added to `group`. Change `item` (its field,
 * operation or value), or set `cancel`.
 */
export interface FilterBuilderItemAddingEventArgs extends EventArgs {
  item: FilterBuilderItem;
  group: FilterBuilderGroup;
  byUser: boolean;
  source: FilterBuilder;
}
