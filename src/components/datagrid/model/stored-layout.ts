import type { data } from '@motifx-community/data';
import type { GridFilters } from '../grid-filters';
import type { GridLayout } from '../grid-layout';

/** What a grid with a `layoutKey` keeps in the browser's storage. */
export interface StoredLayout extends GridLayout {
  filters: GridFilters;
  /** The filter value (the filter builder's conditions; with sync, the columns' filters too). */
  filterValue?: data.FilterExpression | null;
  /** Whether the filter value applies. */
  filterEnabled?: boolean;
  /** The search panel's text. */
  searchText?: string;
  /** The rows per page the user chose. */
  pageSize?: number;
}
