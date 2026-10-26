import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderItem } from './filter-builder-item';
import type { FilterBuilderItemChange } from './filter-builder-item-change';

export interface FilterBuilderItemChangedEventArgs {
  item: FilterBuilderItem;
  change: FilterBuilderItemChange;
  value: unknown;
  previousValue: unknown;
  byUser: boolean;
  source: FilterBuilder;
}
