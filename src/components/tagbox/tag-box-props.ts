import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FieldProps } from '../../parts/field/field-props';
import type { ItemField } from '../../parts/list/item-field';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ItemTemplate } from '../listbox/item-template';

/** Props of `TagBox`: the field props plus its own. Each one is also a settable, reactive property. */
export interface TagBoxProps<T, V> extends FieldProps<V[]> {
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
  /** Shown while nothing is chosen. */
  placeholder?: Bind<string>;
  /** Default `'contains'` (items in memory; a data source uses its own `searchOperator`). */
  searchMode?: Bind<'contains' | 'startswith'>;
  /** Characters to type before the list opens. Default `0`. */
  minSearchLength?: Bind<number>;
  /** Milliseconds between the last key and the search. Default `0` in memory, `250` with a data source. */
  searchDelay?: Bind<number>;
  /** Enter adds the typed text as a new tag when it matches no item. */
  acceptCustomValue?: Bind<boolean>;
  /** Makes the value of a typed text (`acceptCustomValue`); `null` turns it down. Default: the text itself. */
  customValue?: Bind<((text: string) => V | null) | null>;
  /** The first match is highlighted while typing, so Enter takes it. Default `true` (`false` with `acceptCustomValue`). */
  autoHighlight?: Bind<boolean>;
  /** Choosing an item closes the list. Default `false`. */
  closeOnSelect?: Bind<boolean>;
  /** Tags shown; the rest are counted in one more tag ("+3"). Default `0`: all. */
  maxTags?: Bind<number>;
  /** Items that can be chosen at most. Default `0`: any number. */
  maxSelected?: Bind<number>;
  /** A "Select all" row before the items. */
  selectAll?: Bind<boolean>;
  /** Chosen items leave the list (items in memory). */
  hideSelected?: Bind<boolean>;
  /** A press on the field opens the list. Default `true`. */
  openOnFieldClick?: Bind<boolean>;
  /** The arrow that opens the whole list. Default `true`. */
  showDropDownButton?: Bind<boolean>;
  /** A button that removes every tag; Escape does the same while the list is closed. */
  clearButton?: Bind<boolean>;
  itemTemplate?: Bind<ItemTemplate<T> | null>;
  /** Draws a tag's content instead of the item's text. */
  tagTemplate?: Bind<ItemTemplate<T> | null>;
  /** Default `true`. */
  matchWidth?: Bind<boolean>;
  onOpened?: () => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
