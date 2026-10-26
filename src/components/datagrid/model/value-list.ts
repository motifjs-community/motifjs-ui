import type { data } from '@motifx-community/data';
import type { GridFilterValue } from '../grid-filter-value';

/** A header filter's list for one opening: its source, and how its entries map to the values the filter keeps. */
export interface ValueList {
  source: data.DataSource<GridFilterValue, unknown>;
  /** The entry of a value the filter keeps. */
  toEntry(value: unknown): unknown;
  /** The value the filter keeps for an entry. */
  toValue(entry: unknown): unknown;
  /** Every entry the list offers, without a search. */
  all(): Promise<unknown[]>;
}
