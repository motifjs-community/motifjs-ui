import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * Where a lookup column's texts come from: the cell keeps a key (a customer id), the grid shows the
 * text of its item (the customer's name). The items may live on another service than the rows, over
 * another adapter; only the keys on the screen are asked for, several at once.
 *
 * @example
 * { field: 'customerId', title: 'Customer', lookup: { dataSource: customers, valueField: 'id', textField: 'name' } }
 */
export interface GridLookup<T = any> {
  /** The items: a data source (searched and resolved on its service) or an array in memory. */
  dataSource: Bind<data.DataSource<any, any> | readonly unknown[]>;
  /** Field of an item that matches the cell value. Default: the data source's key; for an array of plain values, the value itself. */
  valueField?: string;
  /** The text shown: a field of the item or a function of it. Default: the value. */
  textField?: string | ((item: any) => string);
  /** Fields the editor and the text search look in. Default: `textField` when it is a field. */
  searchFields?: readonly string[];
  /** Narrows the items for a row (cascading lists: the cities of the row's state). `null` row: every item (filter lists). */
  filter?: (row: T | null) => data.FilterExpression | null | undefined;
  /** A clear button in the editor, so the cell can be emptied. Default `false`. */
  allowClearing?: Bind<boolean>;
  /** `'batch'` (default): the unknown keys on screen in one request (`valueField in [...]`, at most `batchSize` keys each). `'byKey'`: one request per key, for services that only fetch one item by key. */
  resolve?: 'batch' | 'byKey';
  /** Keys per request in `'batch'` mode. Default 100. */
  batchSize?: number;
  /** Rows in memory sorted by the key (default, as the service sorts) or by the text shown (every key of the rows is resolved first). */
  sortBy?: Bind<'key' | 'text'>;
  /** The editor: `'dropdown'` (default; with search), `'combobox'` or `'lookup'` (the kit's `Lookup`, a table-like list). */
  editor?: 'dropdown' | 'combobox' | 'lookup';
  /** Props given to the editor (e.g. the `Lookup`'s `columns`). */
  editorOptions?: Record<string, unknown>;
  /** The most items whose text holds the search panel's text that the search turns into keys. Default 100. */
  searchLimit?: number;
}
