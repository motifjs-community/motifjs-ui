import type { data } from '@motifx-community/data';

/** Occurs after the filter builder closes. `applied` indicates that its value became the filter value. */
export interface GridFilterBuilderClosedEventArgs {
  readonly applied: boolean;
  readonly value: data.FilterExpression | null;
}
