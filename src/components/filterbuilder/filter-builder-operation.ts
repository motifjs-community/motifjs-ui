import type { data } from '@motifx-community/data';

/** A condition's operation: one of the data layer's (`'in'` is "is any of", `'notin'` "is none of") or a custom operation's name. */
export type FilterBuilderOperation = data.FilterOperator | (string & {});
