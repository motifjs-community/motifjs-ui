import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** The values of a lookup field come from a list: a drop-down of its items, a tag box for "is any of". */
export interface FilterBuilderLookup {
  /** The items: a data source (searched on its service) or an array in memory. */
  dataSource: Bind<data.DataSource<any, any> | readonly unknown[]>;
  /** Field of an item that is the condition's value. Default: the data source's key; for plain values, the value itself. */
  valueField?: string;
  /** The text shown: a field of the item or a function of it. Default: the value. */
  textField?: string | ((item: any) => string);
  /** A clear button in the drop-down. Default `false`. */
  allowClearing?: Bind<boolean>;
}
