import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { ItemTemplate } from './item-template';
import type { ListSelectionMode } from './list-selection-mode';

/** Props of `ListBox`: the field props plus its own. Each one is also a settable, reactive property. */
export interface ListBoxProps<T, V> extends FieldProps<V | V[] | null> {
  /** Items in memory; searched here. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer; the search goes to it (`searchFields`). Wins over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  textField?: Bind<ItemField<T>>;
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Items in memory only. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  /** `'single'` (default): the value is one value; `'multiple'`: an array. */
  selectionMode?: Bind<ListSelectionMode>;
  /** Multiple: check boxes in front of the items; `false` shows a check mark. Default `true`. */
  showCheckBoxes?: Bind<boolean>;
  /** Multiple: a "Select all" row before the items. */
  selectAll?: Bind<boolean>;
  /** Single: moving through the list with the keys chooses the item. Default `true`. */
  selectionFollowsFocus?: Bind<boolean>;
  /** A search box above the list. */
  searchEnabled?: Bind<boolean>;
  /** Default `'contains'` (items in memory; a data source uses its own `searchOperator`). */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** Milliseconds between the last key and the search. Default `0` in memory, `250` with a data source. */
  searchDelay?: Bind<number>;
  /** The list's height: a number of rows, or a CSS length. Default: as high as its items, up to the list's `max-height` (`list.container`). */
  height?: Bind<number | string | null>;
  itemTemplate?: Bind<ItemTemplate<T> | null>;
  /** What an empty list says; `uiLocale`'s "No items" by default. */
  noItemsText?: Bind<string>;
}
