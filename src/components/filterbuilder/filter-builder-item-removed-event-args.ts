import type { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderItem } from './filter-builder-item';

/** A condition or a group was taken out of `group`. */
export interface FilterBuilderItemRemovedEventArgs {
  item: FilterBuilderItem;
  group: FilterBuilderGroup;
  byUser: boolean;
  source: FilterBuilder;
}
