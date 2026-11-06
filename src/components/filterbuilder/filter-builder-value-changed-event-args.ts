import type { data } from '@motifx-community/data';
import type { FilterBuilder } from './FilterBuilder';

export interface FilterBuilderValueChangedEventArgs {
  value: data.FilterExpression | null;
  previousValue: data.FilterExpression | null;
  /** `true` when the user changed the value, and `false` when it changed programmatically. */
  byUser: boolean;
  source: FilterBuilder;
}
