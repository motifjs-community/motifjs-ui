import type { data } from '@motifx-community/data';

/**
 * A condition's operation: one from the data layer (`'in'` is "is any of", `'notin'` is "is none of") or the name of a
 * custom operation.
 */
export type FilterBuilderOperation = data.FilterOperator | (string & {});
