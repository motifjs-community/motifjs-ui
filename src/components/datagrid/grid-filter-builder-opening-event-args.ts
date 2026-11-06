import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** Occurs before the filter builder opens on the filter value. Set `cancel = true` to keep it closed. */
export interface GridFilterBuilderOpeningEventArgs extends EventArgs {
  readonly value: data.FilterExpression | null;
}
