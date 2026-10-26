import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** The filter builder is about to open on the filter value; `cancel` keeps it closed (open one of your own instead). */
export interface GridFilterBuilderOpeningEventArgs extends EventArgs {
  readonly value: data.FilterExpression | null;
}
