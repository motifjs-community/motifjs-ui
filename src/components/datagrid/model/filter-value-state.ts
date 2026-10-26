import type { data } from '@motifx-community/data';

/** The grid's filter value at one moment: the value, its own conditions, whether it applies, and a key to compare. */
export interface FilterValueState {
  value: data.FilterExpression | null;
  extra: data.FilterExpression | null;
  enabled: boolean;
  key: string;
}
