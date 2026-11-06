import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { ItemTemplate } from './item-template';
import type { ListSelectionMode } from './list-selection-mode';

/** Props of `ListBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface ListBoxProps<T, V> extends FieldProps<V | V[] | null> {
  /** In-memory items, searched on the client. */
  items?: Bind<readonly T[]>;
  /** Items from the data layer, searched using its `searchFields`. This takes precedence over `items`. */
  dataSource?: Bind<data.DataSource<T, unknown> | null>;
  textField?: Bind<ItemField<T>>;
  valueField?: Bind<ItemField<T>>;
  iconField?: Bind<ItemField<T>>;
  /** Applies to in-memory items only. */
  groupField?: Bind<ItemField<T>>;
  enabledField?: Bind<ItemField<T>>;
  /** With `'single'` (the default), the value is one value. With `'multiple'`, it is an array. */
  selectionMode?: Bind<ListSelectionMode>;
  /** In multiple selection, shows check boxes in front of the items. `false` draws a check mark. The default is `true`. */
  showCheckBoxes?: Bind<boolean>;
  /** In multiple selection, adds a "Select all" row before the items. */
  selectAll?: Bind<boolean>;
  /** In single selection, the arrow keys select as they move. The default is `true`. */
  selectionFollowsFocus?: Bind<boolean>;
  /** Adds a search box above the list. */
  searchEnabled?: Bind<boolean>;
  /** The default is `'contains'` for in-memory items. A data source uses its own `searchOperator`. */
  searchMode?: Bind<'contains' | 'startswith'>;
  /**
   * The delay, in milliseconds, between the last keystroke and the search. The default is `0` in memory and `250` with a
   * data source.
   */
  searchDelay?: Bind<number>;
  /**
   * The height, in rows or a CSS length. By default, the list is as tall as its items, up to its `max-height`
   * (`list.container`).
   */
  height?: Bind<number | string | null>;
  itemTemplate?: Bind<ItemTemplate<T> | null>;
  /** The text for an empty list. The default is the `uiLocale` "No items" string. */
  noItemsText?: Bind<string>;
}
