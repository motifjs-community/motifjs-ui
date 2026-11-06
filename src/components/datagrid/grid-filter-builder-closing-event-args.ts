import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FilterBuilder } from '../filterbuilder/FilterBuilder';

/**
 * Occurs before the filter builder closes. With OK (`apply`), its value becomes the filter value. Set
 * `cancel = true` to keep it open.
 */
export interface GridFilterBuilderClosingEventArgs extends EventArgs {
  readonly apply: boolean;
  /** The builder's value. */
  readonly value: data.FilterExpression | null;
  readonly builder: FilterBuilder;
}
