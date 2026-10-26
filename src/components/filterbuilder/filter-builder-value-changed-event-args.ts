import type { data } from '@motifx-community/data';
import type { FilterBuilder } from './FilterBuilder';

export interface FilterBuilderValueChangedEventArgs {
  value: data.FilterExpression | null;
  previousValue: data.FilterExpression | null;
  /** `true` when the user changed it, `false` when code did. */
  byUser: boolean;
  source: FilterBuilder;
}
