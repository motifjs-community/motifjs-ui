import type { data } from '@motifx-community/data';

/** How `KeyedItems` finds items by their text. */
export interface TextSearch<T> {
  /** The text of an item, as the user sees it. */
  textOf: (item: T) => string;
  /** Fields a data source searches on its service. Without them the items are searched here, by `textOf`. */
  searchFields?: readonly string[];
  /** Narrows the items (a data source: on its service; an array: here). */
  filter?: data.FilterExpression | null;
  /** Locale of the comparison. Default: the page's. */
  locale?: string;
}
