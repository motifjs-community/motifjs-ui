import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** The values of a lookup field come from a list: a drop-down of its items, or a tag box for "is any of". */
export interface FilterBuilderLookup {
  /** The items: a data source, searched on its service, or an in-memory array. */
  dataSource: Bind<data.DataSource<any, any> | readonly unknown[]>;
  /**
   * The item field that holds the condition's value. The default is the data source's key, or the value itself for
   * plain values.
   */
  valueField?: string;
  /** The display text: an item field or a function of the item. The default is the value. */
  textField?: string | ((item: any) => string);
  /** Shows a clear button in the drop-down. The default is `false`. */
  allowClearing?: Bind<boolean>;
}
