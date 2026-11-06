import type { data } from '@motifx-community/data';

/** How `KeyedItems` finds items by their text. */
export interface TextSearch<T> {
  /** The text of an item, as the user sees it. */
  textOf: (item: T) => string;
  /** The fields a data source searches on its service. Without them, the items are searched here by `textOf`. */
  searchFields?: readonly string[];
  /** Filters the items, on the service for a data source and here for an array. */
  filter?: data.FilterExpression | null;
  /** The locale of the comparison. The default is the page's locale. */
  locale?: string;
}
