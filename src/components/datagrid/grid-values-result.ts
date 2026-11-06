import type { GridFilterValue } from './grid-filter-value';

/** What `loadValues` returns: a part of the values, and their total count. */
export interface GridValuesResult {
  values: GridFilterValue[];
  total: number;
}
