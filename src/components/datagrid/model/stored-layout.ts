import type { GridFilters } from '../grid-filters';
import type { GridLayout } from '../grid-layout';

/** What a grid with a `layoutKey` keeps in the browser's storage. */
export interface StoredLayout extends GridLayout {
  filters: GridFilters;
  /** The search panel's text. */
  searchText?: string;
  /** The rows per page the user chose. */
  pageSize?: number;
}
