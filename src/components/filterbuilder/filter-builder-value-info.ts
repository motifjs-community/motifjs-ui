import type { FilterBuilderField } from './filter-builder-field';

/** The data passed to `customizeText`: the value, the text the builder would display, and the field. */
export interface FilterBuilderValueInfo {
  value: unknown;
  valueText: string;
  field: FilterBuilderField;
}
