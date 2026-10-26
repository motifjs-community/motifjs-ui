import type { FilterBuilderGroupOperation } from './filter-builder-group-operation';
import type { FilterBuilderItem } from './filter-builder-item';

/** A group of the builder's tree: conditions and groups joined by one operation. Change it through the builder's methods. */
export interface FilterBuilderGroup {
  readonly kind: 'group';
  operation: FilterBuilderGroupOperation;
  readonly items: FilterBuilderItem[];
  /** `null` for the root group. */
  parent: FilterBuilderGroup | null;
}
