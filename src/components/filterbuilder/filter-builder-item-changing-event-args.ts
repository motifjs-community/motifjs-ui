import type { EventArgs } from '@motifx/core';
import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderItem } from './filter-builder-item';
import type { FilterBuilderItemChange } from './filter-builder-item-change';

/** A condition's field, operation or value, or a group's operation, is about to change; change `value`, or `cancel`. */
export interface FilterBuilderItemChangingEventArgs extends EventArgs {
  item: FilterBuilderItem;
  change: FilterBuilderItemChange;
  value: unknown;
  previousValue: unknown;
  byUser: boolean;
  source: FilterBuilder;
}
