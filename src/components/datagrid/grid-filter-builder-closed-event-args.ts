import type { data } from '@motifx-community/data';

/** The filter builder closed; `applied` when its value became the filter value. */
export interface GridFilterBuilderClosedEventArgs {
  readonly applied: boolean;
  readonly value: data.FilterExpression | null;
}
