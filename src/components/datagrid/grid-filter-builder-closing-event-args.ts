import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FilterBuilder } from '../filterbuilder/FilterBuilder';

/** The filter builder is about to close: with OK (`apply`) its value becomes the filter value. `cancel` keeps it open. */
export interface GridFilterBuilderClosingEventArgs extends EventArgs {
  readonly apply: boolean;
  /** The builder's value. */
  readonly value: data.FilterExpression | null;
  readonly builder: FilterBuilder;
}
