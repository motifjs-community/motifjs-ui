import type { FilterBuilderField } from './filter-builder-field';

/** What `customizeText` gets: the value, the text the builder would write, and the field. */
export interface FilterBuilderValueInfo {
  value: unknown;
  valueText: string;
  field: FilterBuilderField;
}
