import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderOperation } from './filter-builder-operation';

/** A condition of the builder's tree. Change it through the builder's methods, so its events run. */
export interface FilterBuilderCondition {
  readonly kind: 'condition';
  /** The field's `dataField`. */
  field: string;
  operation: FilterBuilderOperation;
  /** `[from, to]` for `between`, an array for `in` and `notin`, nothing for `isblank` and `isnotblank`. */
  value: unknown;
  parent: FilterBuilderGroup | null;
}
