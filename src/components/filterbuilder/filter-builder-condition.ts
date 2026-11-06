import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderOperation } from './filter-builder-operation';

/** A condition in the builder's tree. Change it through the builder's methods, so that its events run. */
export interface FilterBuilderCondition {
  readonly kind: 'condition';
  /** The field's `dataField`. */
  field: string;
  operation: FilterBuilderOperation;
  /** `[from, to]` for `between`, an array for `in` and `notin`, and nothing for `isblank` and `isnotblank`. */
  value: unknown;
  parent: FilterBuilderGroup | null;
}
