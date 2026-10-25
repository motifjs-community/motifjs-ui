import type { GridFilterValue } from './grid-filter-value';

/** What `loadValues` answers: a part of the values and how many there are in all. */
export interface GridValuesResult {
  values: GridFilterValue[];
  total: number;
}
