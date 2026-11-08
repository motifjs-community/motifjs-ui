import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/**
 * The source of a lookup column's text: the cell holds a key (a customer id), and the grid displays the
 * text of its item (the customer's name). The items can be on a different service from the rows, over
 * another adapter. Only the keys on screen are requested, several at once.
 *
 * @example
 * { field: 'customerId', title: 'Customer', lookup: { dataSource: customers, valueField: 'id', textField: 'name' } }
 */
export interface GridLookup<T = any> {
  /** The items: a data source (searched and resolved on its service) or an in-memory array. */
  dataSource: Bind<data.DataSource<any, any> | readonly unknown[]>;
  /**
   * The field of an item that matches the cell value. The default is the data source's key, or for an
   * array of plain values, the value itself.
   */
  valueField?: string;
  /** The displayed text: a field of the item or a function of it. The default is the value. */
  textField?: string | ((item: any) => string);
  /** The fields the editor and the text search cover. By default, `textField` when it is a field. */
  searchFields?: readonly string[];
  /**
   * Narrows the items for a row (cascading lists: the cities of the row's state, `context.getValue('state')`,
   * which is the entered value when there is one). A `null` row means every item (filter lists).
   */
  filter?: (row: T | null, context: data.RowCheckContext<T>) => data.FilterExpression | null | undefined;
  /** Shows a clear button in the editor, so that the cell can be cleared. The default is `false`. */
  allowClearing?: Bind<boolean>;
  /**
   * `'batch'` (the default) requests the unknown keys on screen in one request (`valueField in [...]`, at
   * most `batchSize` keys each). `'byKey'` sends one request per key, for services that fetch only one
   * item by key.
   */
  resolve?: 'batch' | 'byKey';
  /** The keys per request in `'batch'` mode. The default is 20, which keeps a request that carries the keys in its URL within common server limits. */
  batchSize?: number;
  /**
   * Sorts in-memory rows by the key (the default, as the service sorts) or by the displayed text (every
   * key of the rows is resolved first).
   */
  sortBy?: Bind<'key' | 'text'>;
  /** The editor: `'dropdown'` (the default, with search), `'combobox'` or `'lookup'` (the kit's `Lookup`, a table-like list). */
  editor?: 'dropdown' | 'combobox' | 'lookup';
  /** The props passed to the editor, such as the `Lookup`'s `columns`. */
  editorOptions?: Record<string, unknown>;
  /** The maximum number of items containing the search panel's text that the search converts to keys (not used when `textFrom` is a field: the search reads that field). The default is 100. */
  searchLimit?: number;
  /** The items the editor's list loads per request while it scrolls (a data source). The default is 50. */
  pageSize?: number;
  /** The maximum number of items containing the header filter's search text that it converts to keys (not used when `textFrom` is a field: the search reads that field). The default is 1000. */
  filterSearchLimit?: number;
  /** With `'byKey'`, the requests at the same time. The default is 6. */
  parallelRequests?: number;
  /** The items searched for a pasted text. The default is 50. */
  pasteSearchLimit?: number;
}
